'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Handshake, DollarSign, AlertTriangle, CheckCircle2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CommitmentModalProps {
  deal: {
    id: string
    name: string
    deal_type: string
    offer_unit_price: number | null
    currency: string
    fee_plans: Array<{
      id: string
      name: string
      description: string
      is_default: boolean
    }>
  }
  investorId: string
  children: React.ReactNode
}

export function CommitmentModal({ deal, investorId, children }: CommitmentModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [requestedUnits, setRequestedUnits] = useState('')
  const [requestedAmount, setRequestedAmount] = useState('')
  const [selectedFeePlanId, setSelectedFeePlanId] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const supabase = createClient()

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelectedFeePlanId(deal.fee_plans.find(fp => fp.is_default)?.id || '')
    } else {
      // Reset form when closing
      setRequestedUnits('')
      setRequestedAmount('')
      setSelectedFeePlanId('')
      setNotes('')
      setAgreedToTerms(false)
      setError(null)
      setSuccess(false)
    }
  }

  const calculateAmount = (units: string, price: number) => {
    const unitsNum = parseFloat(units)
    if (!isNaN(unitsNum) && price > 0) {
      setRequestedAmount((unitsNum * price).toString())
    }
  }

  const handleUnitsChange = (units: string) => {
    setRequestedUnits(units)
    if (deal.offer_unit_price) {
      calculateAmount(units, deal.offer_unit_price)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const units = parseFloat(requestedUnits)
      const amount = parseFloat(requestedAmount)

      if (!units || units <= 0) {
        throw new Error('Please enter a valid number of units')
      }

      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid investment amount')
      }

      if (!agreedToTerms) {
        throw new Error('You must agree to the terms and conditions')
      }

      // Create commitment
      const { data, error } = await supabase
        .from('deal_commitments')
        .insert({
          deal_id: deal.id,
          investor_id: investorId,
          requested_units: units,
          requested_amount: amount,
          selected_fee_plan_id: selectedFeePlanId || null,
          status: 'submitted',
          notes: notes || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error

      // Generate term sheet if fee plan is selected
      if (selectedFeePlanId) {
        const { error: termSheetError } = await supabase
          .from('term_sheets')
          .insert({
            deal_id: deal.id,
            investor_id: investorId,
            fee_plan_id: selectedFeePlanId,
            price_per_unit: deal.offer_unit_price || amount / units,
            currency: deal.currency,
            status: 'draft',
            terms_data: {
              requested_units: units,
              requested_amount: amount,
              notes: notes
            },
            created_by: (await supabase.auth.getUser()).data.user?.id
          })

        if (termSheetError) {
          console.warn('Failed to create term sheet:', termSheetError)
          // Don't fail the whole operation for this
        }
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to submit commitment')
    } finally {
      setLoading(false)
    }
  }

  const selectedFeePlan = deal.fee_plans.find(fp => fp.id === selectedFeePlanId)
  const totalAmount = parseFloat(requestedAmount || '0')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Submit Commitment - {deal.name}
          </DialogTitle>
          <DialogDescription>
            Submit your investment commitment for this deal. This will create a formal commitment that will be reviewed by the VERSO team.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Commitment Submitted!</h3>
            <p className="text-green-700 mb-4">
              Your investment commitment has been submitted successfully and is under review.
            </p>
            {selectedFeePlan && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> A term sheet will be generated based on your selected fee plan and sent to you for review and e-signature.
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Investment Details</CardTitle>
                <CardDescription>
                  Specify your investment commitment amount and terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="units">Requested Units *</Label>
                    <Input
                      id="units"
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={requestedUnits}
                      onChange={(e) => handleUnitsChange(e.target.value)}
                      placeholder="Enter number of units"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Investment Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {deal.currency}
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {deal.offer_unit_price && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Reference Price:</strong> {deal.currency} {deal.offer_unit_price.toFixed(2)} per unit
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is the suggested price per unit for this deal
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Plan Selection */}
            {deal.fee_plans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fee Structure</CardTitle>
                  <CardDescription>
                    Select your preferred fee structure for this investment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feePlan">Fee Plan</Label>
                    <Select value={selectedFeePlanId} onValueChange={setSelectedFeePlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fee plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {deal.fee_plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{plan.name}</span>
                              <span className="text-xs text-gray-500">{plan.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFeePlan && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">{selectedFeePlan.name}</span>
                        {selectedFeePlan.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-blue-700">{selectedFeePlan.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Investment Summary */}
            {totalAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Units:</span>
                      <span className="font-medium">{parseFloat(requestedUnits || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount per Unit:</span>
                      <span className="font-medium">
                        {deal.currency} {totalAmount > 0 && parseFloat(requestedUnits || '0') > 0 
                          ? (totalAmount / parseFloat(requestedUnits || '1')).toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Investment:</span>
                      <span className="text-lg font-bold text-green-600">
                        {deal.currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes, requirements, or special conditions..."
                rows={3}
              />
            </div>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>By submitting this commitment, you acknowledge that:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>This is a binding commitment subject to final approval by VERSO</li>
                    <li>Your investment will be processed according to the selected fee structure</li>
                    <li>All terms and conditions of the deal apply to your investment</li>
                    <li>You have reviewed and understand the investment risks</li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rounded"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions outlined above
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !requestedUnits || !requestedAmount || !agreedToTerms}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Commitment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
