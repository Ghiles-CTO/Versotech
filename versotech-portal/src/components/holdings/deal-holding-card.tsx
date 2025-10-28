'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuickActionsMenu } from '@/components/holdings/quick-actions-menu'
import { PositionDetailModal } from '@/components/holdings/position-detail-modal'
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  Target,
  MessageSquare,
  FileText,
  Calendar,
  AlertCircle,
  Layers,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface DealHolding {
  id: string
  dealId: string
  name: string
  type: 'deal'
  dealType: string
  status: string
  currency: string
  allocation: {
    units: number
    unitPrice: number
    totalValue: number
    status: string
    approvedAt?: string
  }
  spread: {
    markupPerUnit: number
    totalMarkup: number
    markupPct: number
  }
  reservation?: {
    id: string
    requestedUnits: number
    status: string
    expiresAt: string
  } | null
}

interface DealHoldingCardProps {
  deal: DealHolding
}

export function DealHoldingCard({ deal }: DealHoldingCardProps) {
  const [showPositionDetail, setShowPositionDetail] = useState(false)
  const [feesSummary, setFeesSummary] = useState<{ totalAccrued: number; count: number } | null>(null)

  // Fetch fees summary for this deal
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch(`/api/fees?deal_id=${deal.dealId}`)
        if (response.ok) {
          const data = await response.json()
          const dealFees = data.feesByDeal?.find((d: any) => d.dealId === deal.dealId)
          if (dealFees && dealFees.fees.length > 0) {
            const totalAccrued = dealFees.fees
              .filter((f: any) => ['accrued', 'invoiced', 'estimated'].includes(f.status))
              .reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
            setFeesSummary({
              totalAccrued: Math.round(totalAccrued),
              count: dealFees.fees.length
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch fees:', error)
      }
    }

    fetchFees()
  }, [deal.dealId])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: deal.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

  const formatUnits = (units: number) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(units)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'settled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_review':
        return 'Pending Review'
      case 'approved':
        return 'Approved'
      case 'settled':
        return 'Settled'
      default:
        return status
    }
  }

  const getDealTypeLabel = (dealType: string) => {
    switch (dealType) {
      case 'equity_secondary':
        return 'Secondary Equity'
      case 'equity_primary':
        return 'Primary Equity'
      case 'credit_trade_finance':
        return 'Trade Finance'
      default:
        return dealType.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md animate-in fade-in-50 slide-in-from-bottom-4 hover:shadow-purple-200/50">
      <CardHeader className="pb-4 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-50/30 group-hover:to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <Target className="h-4 w-4 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="truncate">{deal.name}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs font-medium bg-purple-50 border-purple-200 text-purple-700">
                DEAL
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getDealTypeLabel(deal.dealType)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {deal.currency}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <Badge className={cn("text-xs font-semibold whitespace-nowrap", getStatusColor(deal.allocation.status))}>
              {getStatusLabel(deal.allocation.status)}
            </Badge>

            {deal.spread.markupPct > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <TrendingUp className="h-3 w-3" />
                +{deal.spread.markupPct.toFixed(1)}% spread
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
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(deal.allocation.totalValue)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Allocation Value</div>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-semibold text-gray-700">
              {formatUnits(deal.allocation.units)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Units Allocated</div>
          </div>
        </div>

        {/* Allocation Details */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Unit Price</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(deal.allocation.unitPrice)}
            </span>
          </div>
          
          {deal.spread.markupPerUnit > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Spread Markup</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(deal.spread.markupPerUnit)}/unit
              </span>
            </div>
          )}
          
          {deal.spread.totalMarkup > 0 && (
            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Total Spread</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(deal.spread.totalMarkup)}
              </span>
            </div>
          )}
        </div>

        {/* Reservation Status */}
        {deal.reservation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Reservation Active</span>
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Expires: {new Date(deal.reservation.expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}

        {/* Last Updated Date - ALWAYS show */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-100 rounded-md px-3 py-2">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            Last updated: {new Date(
              deal.allocation.approvedAt || 
              deal.reservation?.expiresAt ||
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
            Allocation Details
          </Button>

          <Link href={`/versoholdings/deal/${deal.dealId}`} className="flex-1">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md" variant="outline">
              View Page
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>

          <QuickActionsMenu
            holdingId={deal.id}
            holdingName={deal.name}
            holdingType="deal"
            className="px-3 hover:bg-purple-100 transition-all duration-300 hover:scale-105"
          />
        </div>
      </CardContent>

      {/* Position Detail Modal */}
      <PositionDetailModal
        isOpen={showPositionDetail}
        onClose={() => setShowPositionDetail(false)}
        holdingId={deal.id}
        holdingName={deal.name}
        holdingType="deal"
      />
    </Card>
  )
}
