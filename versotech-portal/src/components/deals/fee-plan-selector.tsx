'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface FeePlan {
  id: string
  name: string
  description: string | null
  is_default: boolean
  fee_components: Array<{
    kind: string
    calc_method: string
    rate_bps: number | null
    flat_amount: number | null
    frequency: string
    notes: string | null
  }>
}

interface FeePlanSelectorProps {
  feePlans: FeePlan[]
  selectedPlanId: string | null
  onSelect: (planId: string) => void
  dealCurrency?: string
}

export function FeePlanSelector({ 
  feePlans, 
  selectedPlanId, 
  onSelect, 
  dealCurrency = 'USD' 
}: FeePlanSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Select Your Fee Structure</h4>
      <div className="grid gap-3">
        {feePlans.map((plan) => (
          <div 
            key={plan.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedPlanId === plan.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(plan.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-gray-900">{plan.name}</h5>
              {plan.is_default && (
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
            )}
            <div className="space-y-1">
              {plan.fee_components?.map((component, idx) => (
                <div key={idx} className="text-xs text-gray-500 flex justify-between">
                  <span className="capitalize">{component.kind.replace('_', ' ')}:</span>
                  <span>
                    {component.rate_bps ? `${(component.rate_bps / 100).toFixed(2)}%` : ''}
                    {component.flat_amount ? `${dealCurrency} ${component.flat_amount}` : ''}
                    {component.frequency !== 'one_time' ? ` (${component.frequency})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
