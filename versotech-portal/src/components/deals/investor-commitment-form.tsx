'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  CheckCircle2,
  Timer,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvestorCommitmentFormProps {
  dealId: string
  deal: any
  investorId: string
  existingCommitment?: any
  existingReservation?: any
  existingAllocation?: any
}

export function InvestorCommitmentForm({
  dealId,
  deal,
  investorId,
  existingCommitment,
  existingReservation,
  existingAllocation
}: InvestorCommitmentFormProps) {
  const router = useRouter()
  const [units, setUnits] = useState('')
  const [selectedFeePlanId, setSelectedFeePlanId] = useState(
    deal.fee_plans?.find((p: any) => p.is_default)?.id || ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateAmount = () => {
    const unitCount = parseFloat(units) || 0
    return unitCount * (deal.offer_unit_price || 0)
  }

  const calculateFees = () => {
    const amount = calculateAmount()
    const selectedPlan = deal.fee_plans?.find((p: any) => p.id === selectedFeePlanId)
    
    if (!selectedPlan) return { subscription: 0, total: 0 }

    // Calculate subscription fee
    const subscriptionComponent = selectedPlan.fee_components?.find(
      (c: any) => c.kind === 'subscription'
    )
    const subscriptionFee = subscriptionComponent
      ? (amount * subscriptionComponent.rate_bps) / 10000
      : 0

    return {
      subscription: subscriptionFee,
      total: amount + subscriptionFee
    }
  }

  const handleSubmit = async () => {
    if (!units || parseFloat(units) <= 0) {
      setError('Please enter a valid number of units')
      return
    }

    if (!selectedFeePlanId) {
      setError('Please select a fee plan')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/commitments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investor_id: investorId,
          requested_units: parseFloat(units),
          requested_amount: calculateAmount(),
          selected_fee_plan_id: selectedFeePlanId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit commitment')
      }

      // Refresh the page to show new commitment
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fees = calculateFees()
  const amount = calculateAmount()

  // If user already has an allocation, show success state
  if (existingAllocation) {
    return (
      <Card className="border border-emerald-400/30 bg-emerald-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-200" />
            Allocation Confirmed
          </CardTitle>
          <CardDescription>Your units have been finalized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Allocated Units:</span>
              <span className="font-bold text-foreground">
                {existingAllocation.units.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-medium text-foreground">
                ${existingAllocation.unit_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-white/10">
              <span className="text-muted-foreground">Total Investment:</span>
              <span className="font-bold text-foreground">
                ${(existingAllocation.units * existingAllocation.unit_price).toLocaleString()}
              </span>
            </div>
          </div>
          <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-200">
            Status: {existingAllocation.status}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  // If user has a reservation, show waiting state
  if (existingReservation && existingReservation.status === 'pending') {
    const expiresAt = new Date(existingReservation.expires_at)
    const isExpired = expiresAt < new Date()

    return (
      <Card className="border border-amber-400/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Timer className="h-5 w-5 text-amber-200" />
            Reservation Active
          </CardTitle>
          <CardDescription>
            Your units are temporarily held pending VERSO approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reserved Units:</span>
              <span className="font-bold text-foreground">
                {existingReservation.requested_units.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className={`font-medium ${isExpired ? 'text-red-200' : 'text-foreground'}`}>
                {expiresAt.toLocaleString()}
              </span>
            </div>
          </div>
          {isExpired ? (
            <Badge className="w-full justify-center bg-red-500/20 text-red-200">
              Reservation Expired - Please contact VERSO
            </Badge>
          ) : (
            <Badge className="w-full justify-center bg-amber-500/20 text-amber-200">
              Awaiting Approval
            </Badge>
          )}
        </CardContent>
      </Card>
    )
  }

  // If user has a submitted commitment, show pending state
  if (existingCommitment && existingCommitment.status === 'submitted') {
    return (
      <Card className="border border-blue-400/30 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertCircle className="h-5 w-5 text-blue-200" />
            Commitment Submitted
          </CardTitle>
          <CardDescription>Pending VERSO review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Requested Units:</span>
              <span className="font-bold text-foreground">
                {existingCommitment.requested_units?.toLocaleString() || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Requested Amount:</span>
              <span className="font-medium text-foreground">
                ${existingCommitment.requested_amount?.toLocaleString() || '—'}
              </span>
            </div>
          </div>
          <Badge className="w-full justify-center bg-blue-500/20 text-blue-200">
            Under Review
          </Badge>
        </CardContent>
      </Card>
    )
  }

  // Default: Show commitment form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          Make Commitment
        </CardTitle>
        <CardDescription>Reserve shares and generate your term sheet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fee Plan Selection */}
        <div className="space-y-2">
          <Label htmlFor="fee_plan" className="text-foreground">Fee Structure</Label>
          <Select value={selectedFeePlanId} onValueChange={setSelectedFeePlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Select fee plan" />
            </SelectTrigger>
            <SelectContent>
              {deal.fee_plans?.map((plan: any) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} {plan.is_default && '(Recommended)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Units Input */}
        <div className="space-y-2">
          <Label htmlFor="units" className="text-foreground">Number of Units</Label>
          <Input
            id="units"
            type="number"
            placeholder="e.g., 1000"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            max={deal.units_remaining || 0}
          />
          <p className="text-xs text-muted-foreground">
            Maximum available: {(deal.units_remaining || 0).toLocaleString()} units
          </p>
        </div>

        {/* Calculated Amount */}
        <div className="space-y-2">
          <Label className="text-foreground">Investment Amount</Label>
          <div className="text-2xl font-bold text-foreground">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            {units || '0'} units × ${deal.offer_unit_price?.toFixed(2) || '0'}
          </p>
        </div>

        {/* Fee Breakdown */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="font-medium text-sm mb-3 text-foreground">Fee Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Investment Amount:</span>
              <span>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Upfront Fee:</span>
              <span>${fees.subscription.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2 text-foreground">
              <span>Total Commitment:</span>
              <span>${fees.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Reservation Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-blue-200" />
            <span className="text-sm font-medium text-blue-200">Reservation Hold</span>
          </div>
          <p className="text-xs text-blue-200">
            Shares will be held for 48 hours pending approval
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !units || parseFloat(units) <= 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Commit & Generate Term Sheet
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your commitment requires VERSO approval before allocation
        </p>
      </CardContent>
    </Card>
  )
}

