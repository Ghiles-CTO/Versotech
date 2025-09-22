'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  Timer,
  TrendingDown,
  AlertTriangle,
  Users,
  Clock,
  Activity
} from 'lucide-react'

interface InventorySummary {
  total_units: number
  available_units: number
  reserved_units: number
  allocated_units: number
}

interface RealtimeInventoryProps {
  dealId: string
  initialSummary: InventorySummary
  offerPrice?: number | null
  currency?: string
}

export function RealtimeInventory({ 
  dealId, 
  initialSummary, 
  offerPrice, 
  currency = 'USD' 
}: RealtimeInventoryProps) {
  const [summary, setSummary] = useState<InventorySummary>(initialSummary)
  const [activeViewers, setActiveViewers] = useState(1)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const supabase = createClient()

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `deal_id=eq.${dealId}`,
        },
        () => {
          // Refresh inventory summary when reservations change
          refreshInventory()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'allocations',
          filter: `deal_id=eq.${dealId}`,
        },
        () => {
          // Refresh inventory summary when allocations change
          refreshInventory()
        }
      )
      .subscribe()

    // Simulate active viewers (in real app, this would track actual users)
    const viewerInterval = setInterval(() => {
      setActiveViewers(Math.floor(Math.random() * 8) + 1)
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(viewerInterval)
    }
  }, [dealId])

  const refreshInventory = async () => {
    try {
      const { data, error } = await supabase
        .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })
        .single()

      if (!error && data) {
        setSummary(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error refreshing inventory:', error)
    }
  }

  const allocationPercentage = summary.total_units > 0 ? 
    ((summary.total_units - summary.available_units) / summary.total_units) * 100 : 0

  const urgencyLevel = 
    summary.available_units < summary.total_units * 0.1 ? 'critical' :
    summary.available_units < summary.total_units * 0.3 ? 'high' :
    summary.available_units < summary.total_units * 0.6 ? 'medium' : 'low'

  const urgencyColors = {
    critical: 'text-red-600',
    high: 'text-orange-600', 
    medium: 'text-yellow-600',
    low: 'text-green-600'
  }

  const totalValue = offerPrice ? summary.total_units * offerPrice : null

  return (
    <Card className={`${urgencyLevel === 'critical' ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Live Inventory Status
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time availability • Updated {lastUpdated.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Main Availability Display */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${urgencyColors[urgencyLevel]}`}>
            {summary.available_units.toLocaleString()}
          </div>
          <div className="text-lg text-gray-600">units remaining</div>
          <div className="text-sm text-gray-500">
            of {summary.total_units.toLocaleString()} total
            {totalValue && (
              <span> • {currency} {totalValue.toLocaleString()} total value</span>
            )}
          </div>
        </div>

        {/* Allocation Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Allocation Progress</span>
            <span>{allocationPercentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={allocationPercentage} 
            className={`h-3 ${urgencyLevel === 'critical' ? 'bg-red-100' : ''}`}
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Available</span>
            <span className="font-medium text-green-600">
              {summary.available_units.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reserved</span>
            <span className="font-medium text-yellow-600">
              {summary.reserved_units.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Allocated</span>
            <span className="font-medium text-blue-600">
              {summary.allocated_units.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-medium">
              {summary.total_units.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Urgency Alerts */}
        {urgencyLevel === 'critical' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Critical - Very limited availability remaining
              </span>
            </div>
          </div>
        )}

        {urgencyLevel === 'high' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Limited availability - Act soon to secure your allocation
              </span>
            </div>
          </div>
        )}

        {/* Activity Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {activeViewers} {activeViewers === 1 ? 'investor' : 'investors'} viewing
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
