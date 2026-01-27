'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
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
  dealType: string
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
  icon: typeof Briefcase
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 rounded-md bg-card shadow-sm">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{item.label}</p>
        {item.isBadge && item.value ? (
          <Badge
            variant={item.badgeVariant || 'secondary'}
            className={cn("mt-0.5", item.badgeColor)}
          >
            {displayValue}
          </Badge>
        ) : (
          <p className="text-sm font-medium truncate">{displayValue}</p>
        )}
      </div>
    </div>
  )
}

export function DealKeyDetailsCard({
  dealType,
  currency,
  stockType,
  sector,
  location,
  vehicleName,
  stage,
  round
}: DealKeyDetailsCardProps) {
  const details: DetailItem[] = [
    {
      label: 'Deal Type',
      value: dealType,
      icon: Briefcase,
      isBadge: true,
      badgeColor: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
    },
    {
      label: 'Stock Type',
      value: stockType,
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

  // Filter out items with no value (except Deal Type and Currency which are always shown)
  const visibleDetails = details.filter(
    (d) => d.value || d.label === 'Deal Type' || d.label === 'Currency'
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleDetails.map((item) => (
            <DetailRow key={item.label} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
