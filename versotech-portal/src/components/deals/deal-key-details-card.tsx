'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Tag,
  Globe,
  MapPin,
  Building2,
  TrendingUp,
  Target,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealKeyDetailsCardProps {
  currency: string
  stockType: string | null
  sector: string | null
  location: string | null
  vehicleName: string | null
  stage: string | null
  round: string | null
}

interface DetailItem {
  label: string
  value: string | null
  icon: typeof DollarSign
  isBadge?: boolean
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
  badgeColor?: string
}

function formatValue(value: string | null): string {
  if (!value) return '-'
  // Replace underscores with spaces and capitalize
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function DetailRow({ item }: { item: DetailItem }) {
  const Icon = item.icon
  const displayValue = formatValue(item.value)

  return (
    <div className="px-3 py-2.5 rounded-lg bg-muted/50">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">{item.label}</p>
      </div>
      {item.isBadge && item.value ? (
        <Badge
          variant={item.badgeVariant || 'secondary'}
          className={cn("mt-0.5 whitespace-normal", item.badgeColor)}
        >
          {displayValue}
        </Badge>
      ) : (
        <p className="text-sm font-medium">{displayValue}</p>
      )}
    </div>
  )
}

export function DealKeyDetailsCard({
  currency,
  stockType,
  sector,
  location,
  vehicleName,
  stage,
  round
}: DealKeyDetailsCardProps) {
  const stockTypeLabel = stockType
    ? (stockType === 'common' ? 'Common and Ordinary Shares' : stockType.replace(/_/g, ' '))
    : null

  const details: DetailItem[] = [
    {
      label: 'Stock Type',
      value: stockTypeLabel,
      icon: Tag,
      isBadge: true,
      badgeColor: 'bg-purple-100 text-purple-700 hover:bg-purple-100'
    },
    {
      label: 'Currency',
      value: currency,
      icon: DollarSign
    },
    {
      label: 'Sector',
      value: sector,
      icon: Globe
    },
    {
      label: 'Location',
      value: location,
      icon: MapPin
    },
    {
      label: 'Vehicle',
      value: vehicleName,
      icon: Building2
    },
    {
      label: 'Stage',
      value: stage,
      icon: TrendingUp
    },
    {
      label: 'Round',
      value: round,
      icon: Target
    }
  ]

  // Filter out items with no value (except Currency which is always shown)
  const visibleDetails = details.filter(
    (d) => d.value || d.label === 'Currency'
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          Key Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleDetails.map((item) => (
            <DetailRow key={item.label} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
