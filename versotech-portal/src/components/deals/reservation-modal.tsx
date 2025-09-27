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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Package, DollarSign, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReservationModalProps {
  deal: {
    id: string
    name: string
    deal_type: string
    offer_unit_price: number | null
    currency: string
    close_at: string | null
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

interface ShareLot {
  id: string
  units_total: number
  units_remaining: number
  unit_cost: number
  currency: string
  acquired_at: string
  lockup_until: string | null
  status: string
}

export function ReservationModal({ deal, investorId, children }: ReservationModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [requestedUnits, setRequestedUnits] = useState('')
  const [proposedUnitPrice, setProposedUnitPrice] = useState(deal.offer_unit_price?.toString() || '')
  const [selectedFeePlanId, setSelectedFeePlanId] = useState('')
  const [notes, setNotes] = useState('')
  
  // Inventory data
  const [shareLots, setShareLots] = useState<ShareLot[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [totalAvailableUnits, setTotalAvailableUnits] = useState(0)

  const supabase = createClient()

  const loadInventory = async () => {
    setInventoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('share_lots')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('status', 'available')
        .order('acquired_at', 'asc')

      if (error) throw error

      setShareLots(data || [])
      setTotalAvailableUnits(data?.reduce((sum, lot) => sum + lot.units_remaining, 0) || 0)
    } catch (err) {
      console.error('Error loading inventory:', err)
    } finally {
      setInventoryLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      loadInventory()
      setSelectedFeePlanId(deal.fee_plans.find(fp => fp.is_default)?.id || '')
    } else {
      // Reset form when closing
      setRequestedUnits('')
      setProposedUnitPrice(deal.offer_unit_price?.toString() || '')
      setSelectedFeePlanId('')
      setNotes('')
      setError(null)
      setSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const units = parseFloat(requestedUnits)
      const price = parseFloat(proposedUnitPrice)
      const holdMinutes = 30 // 30 minute hold

      if (!units || units <= 0) {
        throw new Error('Please enter a valid number of units')
      }

      if (!price || price <= 0) {
        throw new Error('Please enter a valid unit price')
      }

      if (units > totalAvailableUnits) {
        throw new Error(`Requested units (${units}) exceed available inventory (${totalAvailableUnits})`)
      }

      // Create reservation
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          deal_id: deal.id,
          investor_id: investorId,
          requested_units: units,
          proposed_unit_price: price,
          expires_at: new Date(Date.now() + holdMinutes * 60 * 1000).toISOString(),
          status: 'pending',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error

      // Create commitment if fee plan is selected
      if (selectedFeePlanId) {
        const { error: commitmentError } = await supabase
          .from('deal_commitments')
          .insert({
            deal_id: deal.id,
            investor_id: investorId,
            requested_units: units,
            requested_amount: units * price,
            selected_fee_plan_id: selectedFeePlanId,
            status: 'submitted',
            created_by: (await supabase.auth.getUser()).data.user?.id
          })

        if (commitmentError) throw commitmentError
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to create reservation')
    } finally {
      setLoading(false)
    }
  }

  const selectedFeePlan = deal.fee_plans.find(fp => fp.id === selectedFeePlanId)
  const totalAmount = parseFloat(requestedUnits) * parseFloat(proposedUnitPrice || '0')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Reserve Units - {deal.name}
          </DialogTitle>
          <DialogDescription>
            Reserve units in this deal with a temporary hold. You have 30 minutes to finalize your commitment.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Reservation Created!</h3>
            <p className="text-green-700">
              Your reservation has been created successfully. You have 30 minutes to finalize your commitment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Inventory</CardTitle>
                <CardDescription>
                  Current available units for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading inventory...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Available Units:</span>
                      <Badge variant="outline" className="text-lg">
                        {totalAvailableUnits.toLocaleString()}
                      </Badge>
                    </div>
                    
                    {shareLots.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Available Lots:</h4>
                        {shareLots.map((lot) => (
                          <div key={lot.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>
                              {lot.units_remaining.toLocaleString()} units @ {lot.currency} {lot.unit_cost.toFixed(2)}
                            </span>
                            <span className="text-gray-500">
                              Acquired: {new Date(lot.acquired_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservation Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units">Requested Units *</Label>
                <Input
                  id="units"
                  type="number"
                  step="0.00000001"
                  min="0"
                  max={totalAvailableUnits}
                  value={requestedUnits}
                  onChange={(e) => setRequestedUnits(e.target.value)}
                  placeholder="Enter number of units"
                  required
                />
                <p className="text-xs text-gray-500">
                  Max: {totalAvailableUnits.toLocaleString()} units
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Proposed Unit Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={proposedUnitPrice}
                  onChange={(e) => setProposedUnitPrice(e.target.value)}
                  placeholder="Enter price per unit"
                  required
                />
                <p className="text-xs text-gray-500">
                  Currency: {deal.currency}
                </p>
              </div>
            </div>

            {/* Fee Plan Selection */}
            {deal.fee_plans.length > 0 && (
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
                {selectedFeePlan && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">{selectedFeePlan.name}</p>
                    <p className="text-sm text-blue-700">{selectedFeePlan.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Total Amount */}
            {totalAmount > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Investment Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {deal.currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or requirements..."
                rows={3}
              />
            </div>

            {/* Terms and Conditions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This reservation will expire in 30 minutes. You must finalize your commitment 
                within this timeframe or the reserved units will be released back to the available inventory.
              </AlertDescription>
            </Alert>

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
                disabled={loading || !requestedUnits || !proposedUnitPrice}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Reservation...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Reserve Units
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
