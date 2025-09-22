'use client'

import { useState, useEffect } from 'react'

interface CommitmentInputProps {
  offerPrice: number | null
  currency: string
  availableUnits: number
  onCommitmentChange: (units: number, amount: number) => void
}

export function CommitmentInput({ 
  offerPrice, 
  currency, 
  availableUnits,
  onCommitmentChange 
}: CommitmentInputProps) {
  const [units, setUnits] = useState(0)
  const [amount, setAmount] = useState(0)

  const handleUnitsChange = (value: number) => {
    const newUnits = Math.min(value, availableUnits) // Ensure doesn't exceed available
    setUnits(newUnits)
    if (offerPrice) {
      const newAmount = newUnits * offerPrice
      setAmount(newAmount)
      onCommitmentChange(newUnits, newAmount)
    }
  }

  const handleAmountChange = (value: number) => {
    setAmount(value)
    if (offerPrice) {
      const newUnits = Math.min(value / offerPrice, availableUnits)
      setUnits(newUnits)
      onCommitmentChange(newUnits, value)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Investment Commitment</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Units
          </label>
          <input
            type="number"
            value={units || ''}
            onChange={(e) => handleUnitsChange(parseFloat(e.target.value) || 0)}
            max={availableUnits}
            min={0}
            step={1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter units"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum: {availableUnits.toLocaleString()} units available
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount ({currency})
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount"
          />
          <p className="text-xs text-gray-500 mt-1">
            {offerPrice ? `@ ${currency} ${offerPrice.toFixed(2)} per unit` : 'Price TBD'}
          </p>
        </div>
      </div>

      {units > 0 && amount > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <div className="font-medium mb-1">Investment Summary</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-green-600">Units:</span> {units.toLocaleString()}
              </div>
              <div>
                <span className="text-green-600">Amount:</span> {currency} {amount.toLocaleString()}
              </div>
            </div>
            {units > availableUnits && (
              <div className="mt-2 text-red-600 text-xs">
                ⚠️ Exceeds available inventory by {(units - availableUnits).toLocaleString()} units
              </div>
            )}
          </div>
        </div>
      )}

      {units === 0 && amount === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Enter your desired investment amount or number of units to proceed
          </p>
        </div>
      )}
    </div>
  )
}
