'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Layers,
  Eye,
  FileText,
  MoreVertical,
  Info,
  Activity,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function CleanDealCard({ deal }: { deal: DealHolding }) {
  const router = useRouter()
  const isApproved = deal.allocation.status === 'approved'
  const isPending = deal.allocation.status === 'pending'
  
  const handleViewDeal = () => {
    router.push(`/versoholdings/deal/${deal.dealId}`)
  }

  const handleViewDocuments = () => {
    router.push(`/versoholdings/documents?deal=${deal.dealId}`)
  }

  const handleTrackStatus = () => {
    router.push(`/versoholdings/deals?status=pending`)
  }

  const statusVariants = {
    approved: { label: 'Approved', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'secondary' as const },
    rejected: { label: 'Rejected', variant: 'outline' as const },
    default: { label: deal.allocation.status, variant: 'outline' as const }
  }

  const currentStatus = statusVariants[deal.allocation.status as keyof typeof statusVariants] || statusVariants.default

  return (
    <Card className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="absolute top-3 right-3">
        <Badge variant={currentStatus.variant}>
          {currentStatus.label}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold line-clamp-1 pr-20">{deal.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              {deal.dealType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {deal.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Allocation Value</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: deal.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(deal.allocation.totalValue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Markup</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: deal.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(deal.spread.totalMarkup)}
              </span>
              <Badge variant="outline" className="text-xs">
                {deal.spread.markupPct.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Units</p>
              <p className="font-medium">{deal.allocation.units.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price</p>
              <p className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: deal.currency
                }).format(deal.allocation.unitPrice)}
              </p>
            </div>
          </div>
        </div>

        {deal.reservation && (
          <Alert className="py-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Reservation expires {new Date(deal.reservation.expiresAt).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewDeal}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Deal
          </Button>
          {isPending ? (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleTrackStatus}
            >
              <Activity className="h-4 w-4 mr-2" />
              Track Status
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleViewDocuments}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
