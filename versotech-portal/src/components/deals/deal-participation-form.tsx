'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FeePlanSelector } from './fee-plan-selector'
import { CommitmentInput } from './commitment-input'
import { toast } from 'sonner'
import { 
  Timer, 
  Calculator, 
  FileText, 
  CheckCircle2,
  Loader2
} from 'lucide-react'

interface DealParticipationFormProps {
  dealId: string
  investorId: string
  feePlans: any[]
  offerPrice: number | null
  currency: string
  availableUnits: number
  isOpen: boolean
}

export function DealParticipationForm({
  dealId,
  investorId,
  feePlans,
  offerPrice,
  currency,
  availableUnits,
  isOpen
}: DealParticipationFormProps) {
  const [selectedFeePlan, setSelectedFeePlan] = useState<string | null>(
    feePlans.find(p => p.is_default)?.id || null
  )
  const [commitmentUnits, setCommitmentUnits] = useState(0)
  const [commitmentAmount, setCommitmentAmount] = useState(0)
  const [isReserving, setIsReserving] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const handleCommitmentChange = (units: number, amount: number) => {
    setCommitmentUnits(units)
    setCommitmentAmount(amount)
  }

  const handleReserveInventory = async () => {
    if (!selectedFeePlan || commitmentUnits <= 0 || !offerPrice) {
      toast.error('Please complete all fields before reserving inventory')
      return
    }

    if (commitmentUnits > availableUnits) {
      toast.error('Cannot reserve more units than available')
      return
    }

    setIsReserving(true)

    try {
      const response = await fetch(`/api/deals/${dealId}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investor_id: investorId,
          requested_units: commitmentUnits,
          proposed_unit_price: offerPrice,
          hold_minutes: 30
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Successfully reserved ${commitmentUnits.toLocaleString()} units for 30 minutes`)
        
        // Reload page to show updated status
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reserve inventory')
      }
    } catch (error) {
      console.error('Reservation error:', error)
      toast.error('Error reserving inventory')
    } finally {
      setIsReserving(false)
    }
  }

  const handleCreateCommitment = async () => {
    if (!selectedFeePlan || commitmentUnits <= 0) {
      toast.error('Please complete all fields before committing')
      return
    }

    setIsCommitting(true)

    try {
      const response = await fetch(`/api/deals/${dealId}/commitments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investor_id: investorId,
          requested_units: commitmentUnits,
          requested_amount: commitmentAmount,
          selected_fee_plan_id: selectedFeePlan
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Commitment submitted successfully! Term sheet will be generated.')
        
        // Reload page to show updated status
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create commitment')
      }
    } catch (error) {
      console.error('Commitment error:', error)
      toast.error('Error creating commitment')
    } finally {
      setIsCommitting(false)
    }
  }

  const canProceed = selectedFeePlan && commitmentUnits > 0 && commitmentUnits <= availableUnits

  if (!isOpen) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">This deal is not currently open for new commitments.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Plan Selection */}
      {feePlans.length > 0 && (
        <FeePlanSelector 
          feePlans={feePlans}
          selectedPlanId={selectedFeePlan}
          onSelect={setSelectedFeePlan}
          dealCurrency={currency}
        />
      )}

      {/* Commitment Input */}
      <CommitmentInput 
        offerPrice={offerPrice}
        currency={currency}
        availableUnits={availableUnits}
        onCommitmentChange={handleCommitmentChange}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            size="lg"
            onClick={handleReserveInventory}
            disabled={!canProceed || isReserving}
          >
            {isReserving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Timer className="mr-2 h-5 w-5" />
            )}
            Reserve Inventory (30 min hold)
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            disabled={!canProceed}
          >
            <Calculator className="mr-2 h-5 w-5" />
            Get Quote
          </Button>
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          variant="secondary"
          onClick={handleCreateCommitment}
          disabled={!canProceed || isCommitting}
        >
          {isCommitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <FileText className="mr-2 h-5 w-5" />
          )}
          Submit Commitment & Generate Term Sheet
        </Button>
      </div>

      {!selectedFeePlan && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Please select a fee plan to continue
          </p>
        </div>
      )}

      {commitmentUnits > availableUnits && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Cannot commit to more units than available in inventory
          </p>
        </div>
      )}
    </div>
  )
}
