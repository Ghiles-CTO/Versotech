'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { QuickActionsMenu } from '@/components/holdings/quick-actions-menu'
import { PositionDetailModal } from '@/components/holdings/position-detail-modal'
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building,
  DollarSign,
  MessageSquare,
  FileText,
  Calendar,
  Layers,
  MoreHorizontal,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EnhancedHolding {
  id: string
  name: string
  type: string
  domicile?: string
  currency: string
  created_at: string
  logo_url?: string
  website_url?: string
  investment_name?: string
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
    lastUpdated?: string
  } | null
  subscription: {
    commitment: number
    currency: string
    status: string
  } | null
  valuation: {
    navTotal: number
    navPerUnit: number
    asOfDate: string
  } | null
  performance: {
    unrealizedGainPct: number
  } | null
  fees?: {
    accruedAmount: number
    count: number
  } | null
}

interface VehicleHoldingCardProps {
  holding: EnhancedHolding
}

export function VehicleHoldingCard({ holding }: VehicleHoldingCardProps) {
  const [showPositionDetail, setShowPositionDetail] = useState(false)
  const [feesSummary, setFeesSummary] = useState<{ totalAccrued: number; count: number } | null>(null)

  // Fetch fees summary for this vehicle
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch(`/api/fees?vehicle_id=${holding.id}`)
        if (response.ok) {
          const data = await response.json()
          const vehicleFees = data.feesByVehicle?.find((v: any) => v.vehicleId === holding.id)
          if (vehicleFees && vehicleFees.fees.length > 0) {
            const totalAccrued = vehicleFees.fees
              .filter((f: any) => ['accrued', 'invoiced', 'estimated'].includes(f.status))
              .reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
            setFeesSummary({
              totalAccrued: Math.round(totalAccrued),
              count: vehicleFees.fees.length
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch fees:', error)
      }
    }

    fetchFees()
  }, [holding.id])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: holding.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

  const formatUnits = (units: number) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(units)

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fund':
        return 'bg-blue-100 border-blue-200 text-blue-700'
      case 'spv':
        return 'bg-green-100 border-green-200 text-green-700'
      case 'real_estate':
        return 'bg-orange-100 border-orange-200 text-orange-700'
      default:
        return 'bg-muted border-border text-muted-foreground'
    }
  }

  const initial = (holding.name || 'V').trim().charAt(0).toUpperCase() || 'V'

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md animate-in fade-in-50 slide-in-from-bottom-4 hover:shadow-blue-200/50">
      <CardHeader className="pb-4 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50/30 group-hover:to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Avatar className="h-10 w-10 border border-slate-100 bg-white shadow-sm">
                {holding.logo_url ? (
                  <AvatarImage
                    src={holding.logo_url}
                    alt={holding.name}
                    className="object-contain p-2"
                  />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {initial}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="truncate">{holding.name}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 ml-13">
              <Badge variant="outline" className={cn("text-xs font-medium", getTypeColor(holding.type))}>
                {holding.type?.toUpperCase() || 'FUND'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {holding.domicile} • {holding.currency || 'USD'}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {holding.performance?.unrealizedGainPct !== undefined && (
              <div className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
                holding.performance.unrealizedGainPct > 0
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : holding.performance.unrealizedGainPct < 0
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-muted text-muted-foreground border border-border'
              )}>
                {holding.performance.unrealizedGainPct > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : holding.performance.unrealizedGainPct < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
                {holding.performance.unrealizedGainPct > 0 ? '+' : ''}
                {holding.performance.unrealizedGainPct.toFixed(1)}%
              </div>
            )}

            {feesSummary && feesSummary.totalAccrued > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Receipt className="h-3 w-3" />
                {formatCurrency(feesSummary.totalAccrued)} fees
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {holding.position?.currentValue
                ? formatCurrency(holding.position.currentValue)
                : 'N/A'
              }
            </div>
            <div className="text-xs text-muted-foreground font-medium">Current Value</div>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-semibold text-muted-foreground">
              {holding.subscription?.commitment
                ? formatCurrency(holding.subscription.commitment)
                : 'N/A'
              }
            </div>
            <div className="text-xs text-muted-foreground font-medium">Commitment</div>
          </div>
        </div>

        {/* Performance Summary */}
        {holding.position && (
          <div className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Units Held</span>
              <span className="font-semibold text-foreground">
                {formatUnits(holding.position.units)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Cost Basis</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(holding.position.costBasis)}
              </span>
            </div>
            {holding.valuation && holding.valuation.navPerUnit > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">NAV per Unit</span>
                <span className="font-semibold text-blue-600">
                  {holding.currency || 'USD'} {holding.valuation.navPerUnit?.toFixed(3)}
                </span>
              </div>
            )}
            {holding.position.unrealizedGain !== 0 && (
              <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground font-medium">Unrealized P&L</span>
                <span className={cn(
                  "font-semibold",
                  holding.position.unrealizedGain > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {holding.position.unrealizedGain > 0 ? '+' : ''}
                  {formatCurrency(holding.position.unrealizedGain)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Updated Date - ALWAYS show */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            Last updated: {new Date(
              holding.valuation?.asOfDate || 
              holding.position?.lastUpdated || 
              holding.created_at ||
              new Date().toISOString()
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short', 
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Enhanced Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => setShowPositionDetail(true)}
            className="flex-1 transition-all duration-300 hover:scale-105 hover:shadow-md"
            variant="outline"
          >
            <Layers className="h-4 w-4 mr-2 transition-transform duration-300 hover:rotate-12" />
            Position Details
          </Button>

          <Button 
            asChild 
            className="flex-1 transition-all duration-300 hover:scale-105 hover:shadow-md" 
            variant="outline"
          >
            <Link href={`/versotech_main/portfolio/${holding.id}`}>
              View Page
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>

          <QuickActionsMenu
            holdingId={holding.id}
            holdingName={holding.name}
            holdingType="vehicle"
            className="px-3 hover:bg-blue-100 transition-all duration-300 hover:scale-105"
          />
        </div>
      </CardContent>

      {/* Position Detail Modal */}
      <PositionDetailModal
        isOpen={showPositionDetail}
        onClose={() => setShowPositionDetail(false)}
        holdingId={holding.id}
        holdingName={holding.name}
        holdingType="vehicle"
      />
    </Card>
  )
}
