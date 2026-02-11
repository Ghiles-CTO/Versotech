'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Calendar, Clock, MapPin, TrendingUp } from 'lucide-react'
import { DealLogo } from '@/components/deals/deal-logo'

interface DataRoomPreviewCardProps {
  deal: {
    id: string
    name: string
    company_name: string | null
    company_logo_url: string | null
    stage: string | null
    sector: string | null
    location: string | null
  }
  access: {
    granted_at: string
    expires_at: string | null
  }
  documentCount: number
  status?: string | null
}

function formatDate(value: string | null) {
  if (!value) return 'Open ended'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function daysUntil(date: string | null) {
  if (!date) return null
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export function DataRoomPreviewCard({ deal, access, documentCount, status }: DataRoomPreviewCardProps) {
  const daysRemaining = daysUntil(access.expires_at)
  return (
    <Link href={`/versotech_main/opportunities/${deal.id}?tab=data-room`}>
      <Card className="cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all border-2 border-border bg-card h-full">
        <CardContent className="p-4 space-y-3">
          {/* Header with logo and name */}
          <div className="flex items-start gap-3">
            <DealLogo
              src={deal.company_logo_url}
              alt={`${deal.company_name ?? deal.name} logo`}
              size={48}
              rounded="lg"
              className="flex-shrink-0 bg-card border-2 border-border"
              fallbackText={deal.name?.charAt(0) ?? 'D'}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground truncate">
                {deal.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-foreground mt-0.5">
                <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{deal.company_name ?? 'Issuer pending'}</span>
              </div>
            </div>
            {daysRemaining !== null && daysRemaining <= 7 && (
              <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-xs">
                {daysRemaining}d left
              </Badge>
            )}
          </div>

          {/* Deal details */}
          {(deal.stage || deal.sector || deal.location) && (
            <div className="flex flex-wrap gap-1.5">
              {deal.stage && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{deal.stage}</span>
                </div>
              )}
              {deal.sector && (
                <Badge variant="outline" className="text-xs border-border text-foreground bg-card">
                  {deal.sector}
                </Badge>
              )}
              {deal.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{deal.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Timeline and documents */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Granted {formatDate(access.granted_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <FileText className="h-3 w-3 text-blue-600" />
                <span>{documentCount}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{access.expires_at ? `Expires ${formatDate(access.expires_at)}` : 'No expiry'}</span>
              </div>
              {status && (
                <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                  {status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
