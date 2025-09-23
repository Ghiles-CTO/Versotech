'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'

interface InventorySummary {
  units_available: number
  active_reservations: number
  utilization_percent: string
  total_units: number
  last_updated?: string
}

interface RealTimeInventoryProps {
  dealId: string
  initialData: InventorySummary
  className?: string
}

export function RealTimeInventory({ dealId, initialData, className }: RealTimeInventoryProps) {
  const [inventory, setInventory] = useState<InventorySummary>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchInventoryUpdate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/deals/${dealId}/inventory`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch inventory update:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchInventoryUpdate, 30000)
    return () => clearInterval(interval)
  }, [dealId])

  const utilizationPercent = parseFloat(inventory.utilization_percent || '0')
  const isLowInventory = inventory.units_available < 1000

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Live Inventory
          </div>
          <button
            onClick={fetchInventoryUpdate}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
        </CardTitle>
        <CardDescription>
          Real-time share availability with reservation activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {inventory.units_available.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Units Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {inventory.active_reservations}
            </p>
            <p className="text-sm text-gray-500">Active Reservations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {utilizationPercent.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Utilization</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Inventory Status</span>
            <span>{inventory.total_units.toLocaleString()} total units</span>
          </div>
          <Progress value={utilizationPercent} className="h-2" />
        </div>

        {isLowInventory && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              Limited availability - only {inventory.units_available.toLocaleString()} units remaining
            </p>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}