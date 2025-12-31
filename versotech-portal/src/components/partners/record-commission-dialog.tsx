'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

type Deal = {
  id: string
  name: string
  company_name: string | null
  currency: string
}

type FeePlan = {
  id: string
  name: string
  components: any[]
}

interface RecordCommissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partnerId: string
  partnerName: string
  deals: Deal[]
  feePlans: FeePlan[]
  onSuccess: () => void
}

const BASIS_TYPES = [
  { value: 'invested_amount', label: 'Invested Amount' },
  { value: 'spread', label: 'Spread' },
  { value: 'management_fee', label: 'Management Fee' },
  { value: 'performance_fee', label: 'Performance Fee' },
]

export function RecordCommissionDialog({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  deals,
  feePlans,
  onSuccess,
}: RecordCommissionDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [dealId, setDealId] = useState<string>('')
  const [feePlanId, setFeePlanId] = useState<string>('')
  const [basisType, setBasisType] = useState<string>('invested_amount')
  const [rateBps, setRateBps] = useState<string>('')
  const [baseAmount, setBaseAmount] = useState<string>('')
  const [accrualAmount, setAccrualAmount] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [paymentDueDate, setPaymentDueDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDealId('')
      setFeePlanId('')
      setBasisType('invested_amount')
      setRateBps('')
      setBaseAmount('')
      setAccrualAmount('')
      setCurrency('USD')
      setPaymentDueDate('')
      setNotes('')
      setError(null)
    }
  }, [open])

  // Auto-calculate accrual when rate and base amount change
  useEffect(() => {
    if (rateBps && baseAmount) {
      const rate = parseFloat(rateBps) / 10000 // Convert bps to decimal
      const base = parseFloat(baseAmount)
      if (!isNaN(rate) && !isNaN(base)) {
        const calculated = (base * rate).toFixed(2)
        setAccrualAmount(calculated)
      }
    }
  }, [rateBps, baseAmount])

  // Update currency when deal changes
  useEffect(() => {
    if (dealId) {
      const deal = deals.find(d => d.id === dealId)
      if (deal?.currency) {
        setCurrency(deal.currency)
      }
    }
  }, [dealId, deals])

  // Auto-fill rate from fee plan
  useEffect(() => {
    if (feePlanId) {
      const plan = feePlans.find(p => p.id === feePlanId)
      if (plan?.components && plan.components.length > 0) {
        // Find first component with rate_bps
        const comp = plan.components.find((c: any) => c.rate_bps)
        if (comp?.rate_bps) {
          setRateBps(comp.rate_bps.toString())
        }
      }
    }
  }, [feePlanId, feePlans])

  const handleSubmit = async () => {
    // Validation
    if (!rateBps || parseFloat(rateBps) <= 0) {
      setError('Rate is required and must be greater than 0')
      return
    }
    if (!accrualAmount || parseFloat(accrualAmount) <= 0) {
      setError('Commission amount is required and must be greater than 0')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        partner_id: partnerId,
        deal_id: dealId || undefined,
        fee_plan_id: feePlanId || undefined,
        basis_type: basisType,
        rate_bps: parseInt(rateBps, 10),
        base_amount: baseAmount ? parseFloat(baseAmount) : undefined,
        accrual_amount: parseFloat(accrualAmount),
        currency,
        payment_due_date: paymentDueDate || undefined,
        notes: notes || undefined,
      }

      const response = await fetch('/api/arrangers/me/partner-commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record commission')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('[RecordCommissionDialog] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to record commission')
    } finally {
      setSaving(false)
    }
  }

  const ratePercent = rateBps ? (parseFloat(rateBps) / 100).toFixed(2) : '0.00'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Commission</DialogTitle>
          <DialogDescription>
            Record a commission owed to {partnerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          {/* Deal Selection */}
          <div className="space-y-2">
            <Label>Deal (Optional)</Label>
            <Select value={dealId} onValueChange={setDealId}>
              <SelectTrigger>
                <SelectValue placeholder="Select deal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific deal</SelectItem>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.name} {deal.company_name && `(${deal.company_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Plan Selection */}
          {feePlans.length > 0 && (
            <div className="space-y-2">
              <Label>Fee Plan (Optional)</Label>
              <Select value={feePlanId} onValueChange={setFeePlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee plan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No fee plan</SelectItem>
                  {feePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basis Type */}
          <div className="space-y-2">
            <Label>Commission Basis</Label>
            <Select value={basisType} onValueChange={setBasisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASIS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate and Base Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rate (basis points) *</Label>
              <Input
                type="number"
                value={rateBps}
                onChange={(e) => setRateBps(e.target.value)}
                placeholder="e.g., 100 = 1%"
              />
              {rateBps && (
                <p className="text-xs text-muted-foreground">= {ratePercent}%</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Base Amount ({currency})</Label>
              <Input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                placeholder="e.g., 100000"
              />
            </div>
          </div>

          {/* Commission Amount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Commission Amount ({currency}) *
              {rateBps && baseAmount && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calculator className="h-3 w-3" />
                  Auto-calculated
                </span>
              )}
            </Label>
            <Input
              type="number"
              value={accrualAmount}
              onChange={(e) => setAccrualAmount(e.target.value)}
              placeholder="Commission amount"
            />
            {accrualAmount && (
              <p className="text-sm font-medium text-primary">
                {formatCurrency(parseFloat(accrualAmount), currency)}
              </p>
            )}
          </div>

          {/* Payment Due Date */}
          <div className="space-y-2">
            <Label>Payment Due Date (Optional)</Label>
            <Input
              type="date"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Commission'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
