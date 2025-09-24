'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface DealInventoryPanelProps {
  dealId: string
  dealName: string
  dealStatus: string
  offerPrice?: number
  currency?: string
}

interface InventorySummary {
  total_units: number
  available_units: number
  reserved_units: number
  allocated_units: number
}

interface ShareLot {
  id: string
  units_total: number
  units_remaining: number
  unit_cost: number
  currency: string
  acquired_at: string
  status: string
  share_sources?: {
    kind: string
    counterparty_name: string
  }
}

interface Reservation {
  id: string
  requested_units: number
  proposed_unit_price: number
  expires_at: string
  status: string
  created_at: string
  investors?: {
    legal_name: string
  }
}

export default function DealInventoryPanel({ 
  dealId, 
  dealName, 
  dealStatus, 
  offerPrice = 0,
  currency = 'USD' 
}: DealInventoryPanelProps) {
  const [inventory, setInventory] = useState<InventorySummary | null>(null)
  const [shareLots, setShareLots] = useState<ShareLot[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Reservation form state
  const [investorId, setInvestorId] = useState('')
  const [requestedUnits, setRequestedUnits] = useState('')
  const [proposedPrice, setProposedPrice] = useState(offerPrice.toString())
  const [holdMinutes, setHoldMinutes] = useState('30')

  useEffect(() => {
    loadInventoryData()
  }, [dealId])

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      
      // Load inventory summary
      const inventoryResponse = await fetch(`/api/deals/${dealId}/inventory`)
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setInventory(inventoryData.summary)
        setShareLots(inventoryData.share_lots || [])
      }

      // Load reservations
      const reservationsResponse = await fetch(`/api/deals/${dealId}/reservations`)
      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json()
        setReservations(reservationsData.reservations || [])
      }

    } catch (error) {
      console.error('Error loading inventory data:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const createReservation = async () => {
    if (!investorId || !requestedUnits || !proposedPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setCreating(true)
      
      const response = await fetch(`/api/deals/${dealId}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          investor_id: investorId,
          requested_units: parseFloat(requestedUnits),
          proposed_unit_price: parseFloat(proposedPrice),
          hold_minutes: parseInt(holdMinutes)
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        setInvestorId('')
        setRequestedUnits('')
        setProposedPrice(offerPrice.toString())
        setHoldMinutes('30')
        loadInventoryData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to create reservation')
      }

    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Failed to create reservation')
    } finally {
      setCreating(false)
    }
  }

  const finalizeReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/finalize`, {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        loadInventoryData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to finalize reservation')
      }

    } catch (error) {
      console.error('Error finalizing reservation:', error)
      toast.error('Failed to finalize reservation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'held': return 'bg-yellow-100 text-yellow-800'
      case 'exhausted': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateUtilization = () => {
    if (!inventory || inventory.total_units === 0) return 0
    return ((inventory.total_units - inventory.available_units) / inventory.total_units) * 100
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
        
        {inventory && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {inventory.total_units.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {inventory.available_units.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {inventory.reserved_units.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Reserved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {inventory.allocated_units.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Allocated</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Utilization</span>
                <span>{calculateUtilization().toFixed(1)}%</span>
              </div>
              <Progress value={calculateUtilization()} className="h-2" />
            </div>
          </div>
        )}
      </Card>

      {/* Create Reservation Form */}
      {dealStatus === 'open' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Reservation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investor_id">Investor ID</Label>
              <Input
                id="investor_id"
                value={investorId}
                onChange={(e) => setInvestorId(e.target.value)}
                placeholder="Enter investor UUID"
              />
            </div>
            
            <div>
              <Label htmlFor="requested_units">Requested Units</Label>
              <Input
                id="requested_units"
                type="number"
                value={requestedUnits}
                onChange={(e) => setRequestedUnits(e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="proposed_price">Proposed Price ({currency})</Label>
              <Input
                id="proposed_price"
                type="number"
                step="0.01"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="hold_minutes">Hold Duration (minutes)</Label>
              <Input
                id="hold_minutes"
                type="number"
                value={holdMinutes}
                onChange={(e) => setHoldMinutes(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          
          <Button 
            onClick={createReservation} 
            disabled={creating}
            className="mt-4"
          >
            {creating ? 'Creating...' : 'Create Reservation'}
          </Button>
        </Card>
      )}

      {/* Share Lots */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Share Lots</h3>
        
        <div className="space-y-3">
          {shareLots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(lot.status)}>
                    {lot.status}
                  </Badge>
                  <span className="font-medium">
                    {lot.units_remaining.toLocaleString()} / {lot.units_total.toLocaleString()} units
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Cost: {currency} {lot.unit_cost} • Source: {lot.share_sources?.kind} ({lot.share_sources?.counterparty_name})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Available: {((lot.units_remaining / lot.units_total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          
          {shareLots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No share lots available for this deal
            </div>
          )}
        </div>
      </Card>

      {/* Active Reservations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Reservations</h3>
        
        <div className="space-y-3">
          {reservations.filter(r => r.status === 'pending').map((reservation) => (
            <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status}
                  </Badge>
                  <span className="font-medium">
                    {reservation.requested_units.toLocaleString()} units @ {currency} {reservation.proposed_unit_price}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Investor: {reservation.investors?.legal_name} • 
                  Expires: {new Date(reservation.expires_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => finalizeReservation(reservation.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalize
                </Button>
              </div>
            </div>
          ))}
          
          {reservations.filter(r => r.status === 'pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active reservations
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
