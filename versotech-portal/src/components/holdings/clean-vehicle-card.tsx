'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building,
  Globe,
  Eye,
  FileText,
  Download,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedHolding {
  id: string
  name: string
  type: string
  domicile?: string
  currency: string
  created_at: string
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
      return 'bg-gray-600 border-gray-500 text-white font-medium'
  }
}

export function CleanVehicleCard({ holding }: { holding: EnhancedHolding }) {
  const router = useRouter()
  const hasPosition = holding.position && holding.position.currentValue > 0
  const isPositive = holding.position?.unrealizedGainPct ? holding.position.unrealizedGainPct >= 0 : false
  const rawStatus =
    holding.status ||
    holding.allocation_status ||
    holding.subscription?.status ||
    (hasPosition ? 'active' : 'pending')
  const status = rawStatus.toLowerCase()
  const statusLabel = status.replace(/_/g, ' ').toUpperCase()

  const handleViewDetails = () => {
    router.push(`/versoholdings/vehicle/${holding.id}`)
  }

  const handleViewReports = () => {
    router.push(`/versoholdings/reports?vehicle=${holding.id}`)
  }

  const handleDownloadStatement = () => {
    // TODO: Implement download functionality
    console.log('Download statement for:', holding.id)
  }

  return (
    <Card className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">{holding.name}</CardTitle>
            <div className="flex items-center gap-2">
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
              <DropdownMenuItem onClick={handleViewReports}>
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadStatement}>
                <Download className="mr-2 h-4 w-4" />
                Download Statement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasPosition ? (
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

            <div className="pt-3 border-t">
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
              <div className="pt-3 border-t">
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
              <Badge variant="outline" className="bg-white/5 border-white/10 text-xs capitalize">
                Allocation Status: {(holding.allocation_status || holding.subscription?.status || 'pending').replace(/_/g, ' ')}
              </Badge>
              {holding.subscription?.commitment !== null && holding.subscription?.commitment !== undefined && (
                <Badge variant="outline" className="bg-white/5 border-white/10 text-xs">
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

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewReports}
          >
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
