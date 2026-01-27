'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  MoreVertical,
  DollarSign,
  Calendar,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SellPositionForm } from '@/components/investor/sell-position-form'

interface DocumentInfo {
  id: string
  name: string
  type: string
  file_key: string
  created_at: string
}

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
  allocation_status?: string | null
  invite_sent_at?: string | null
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
    lastUpdated?: string
  } | null
  subscription: {
    id?: string  // For sell request form
    commitment: number | null
    currency: string
    status: string
    effective_date?: string | null
    funding_due_at?: string | null
    units?: number | null
  } | null
  valuation: {
    navTotal: number
    navPerUnit: number
    asOfDate: string
  } | null
  performance: {
    unrealizedGainPct: number
  } | null
  status?: string
  documents?: {
    nda: DocumentInfo | null
    subscription_pack: DocumentInfo | null
    certificate: DocumentInfo | null
  }
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active':
    case 'committed':
      return 'bg-emerald-600 border-emerald-500 text-white font-medium'
    case 'pending':
      return 'bg-amber-600 border-amber-500 text-white font-medium'
    case 'closed':
      return 'bg-blue-600 border-blue-500 text-white font-medium'
    case 'cancelled':
      return 'bg-red-600 border-red-500 text-white font-medium'
    default:
      return 'bg-muted border-border text-foreground font-medium'
  }
}

interface VehicleCardProps {
  holding: EnhancedHolding
  detailsBasePath?: string
}

export function VehicleCard({
  holding,
  detailsBasePath = '/versotech_main/portfolio'
}: VehicleCardProps) {
  const router = useRouter()
  const [sellSheetOpen, setSellSheetOpen] = useState(false)

  // Check if has actual position with units (units matter, not currentValue which depends on NAV)
  const hasPosition = holding.position && holding.position.units > 0

  // Show position data when there's a position with units
  const showPositionData = hasPosition

  const canSell = hasPosition && holding.subscription?.id
  const isPositive = holding.position?.unrealizedGainPct ? holding.position.unrealizedGainPct >= 0 : false
  const rawStatus =
    holding.status ||
    holding.allocation_status ||
    holding.subscription?.status ||
    (hasPosition ? 'active' : 'pending')
  const status = rawStatus.toLowerCase()
  const statusLabel = status.replace(/_/g, ' ').toUpperCase()

  const handleViewDetails = () => {
    router.push(`${detailsBasePath}/${holding.id}`)
  }

  const handleDownloadDocument = async (doc: DocumentInfo) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)
      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <Card className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[420px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {/* Investment branding (underlying company/asset) */}
            <div className="flex items-center gap-3">
              {holding.logo_url ? (
                <Image
                  src={holding.logo_url}
                  alt={holding.investment_name || 'Investment'}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-contain bg-muted p-1.5"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {(holding.investment_name || holding.name || 'V').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                {holding.investment_name && (
                  <span className="text-sm font-medium text-muted-foreground block">
                    {holding.investment_name}
                  </span>
                )}
                <CardTitle className="text-lg font-semibold line-clamp-1">{holding.name}</CardTitle>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {holding.type.replace(/_/g, ' ')}
              </Badge>
              {holding.domicile && (
                <Badge variant="outline" className="text-xs">
                  {holding.domicile}
                </Badge>
              )}
              <Badge className={cn('text-xs', getStatusStyles(status))}>{statusLabel}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canSell && (
                <DropdownMenuItem onClick={() => setSellSheetOpen(true)}>
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Request Sale
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          {showPositionData ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Value</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: holding.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(holding.position!.currentValue)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unrealized Gain</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isPositive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: holding.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        signDisplay: 'always'
                      }).format(holding.position!.unrealizedGain)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {isPositive ? '+' : '-'}{Math.abs(holding.position!.unrealizedGainPct).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t mt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{holding.position!.units.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost Basis</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: holding.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(holding.position!.costBasis)}
                    </p>
                  </div>
                </div>
              </div>

              {holding.valuation && (
                <div className="pt-3 border-t mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">NAV per Unit</span>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: holding.currency
                        }).format(holding.valuation.navPerUnit)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(holding.valuation.asOfDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <DollarSign className="h-12 w-12 text-muted-foreground/20 mx-auto mb-1" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Awaiting Funding</p>
                <p className="text-sm text-muted-foreground">
                  Your commitment has been recorded. We will notify you once units are issued.
                </p>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="bg-muted/50 border-border text-xs capitalize">
                  Allocation Status: {(holding.allocation_status || holding.subscription?.status || 'pending').replace(/_/g, ' ')}
                </Badge>
                {holding.subscription?.commitment !== null && holding.subscription?.commitment !== undefined && (
                  <Badge variant="outline" className="bg-muted/50 border-border text-xs">
                    Commitment:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: holding.subscription?.currency || holding.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(holding.subscription.commitment ?? 0)}
                  </Badge>
                )}
                {holding.subscription?.funding_due_at && (
                  <p className="text-xs text-muted-foreground">
                    Funding due {new Date(holding.subscription.funding_due_at).toLocaleDateString()}
                  </p>
                )}
                {holding.invite_sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Invite sent {new Date(holding.invite_sent_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        {holding.documents && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Documents</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {holding.documents.nda && (
                <button
                  onClick={() => handleDownloadDocument(holding.documents!.nda!)}
                  className="text-emerald-500 hover:text-emerald-400 hover:underline"
                >
                  NDA
                </button>
              )}
              {holding.documents.subscription_pack && (
                <button
                  onClick={() => handleDownloadDocument(holding.documents!.subscription_pack!)}
                  className="text-emerald-500 hover:text-emerald-400 hover:underline"
                >
                  Sub Pack
                </button>
              )}
              {holding.documents.certificate && (
                <button
                  onClick={() => handleDownloadDocument(holding.documents!.certificate!)}
                  className="text-emerald-500 hover:text-emerald-400 hover:underline"
                >
                  Certificate
                </button>
              )}
              {!holding.documents.nda && !holding.documents.subscription_pack && !holding.documents.certificate && (
                <span className="text-muted-foreground text-xs">No documents</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 mt-auto space-y-2">
          {canSell && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => setSellSheetOpen(true)}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Request Sale
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>

      {/* Sell Position Sheet */}
      {canSell && (
        <Sheet open={sellSheetOpen} onOpenChange={setSellSheetOpen}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Request Position Sale</SheetTitle>
            </SheetHeader>
            <SellPositionForm
              subscriptionId={holding.subscription!.id!}
              vehicleName={holding.name}
              fundedAmount={holding.position!.costBasis}
              currency={holding.currency}
              onSuccess={() => setSellSheetOpen(false)}
              onCancel={() => setSellSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </Card>
  )
}
