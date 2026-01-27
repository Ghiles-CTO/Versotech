'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'

export type SubscriptionFilters = {
  status?: string
  vehicle?: string
  investorType?: string
  minCommitment?: number
  maxCommitment?: number
  dateFrom?: string
  dateTo?: string
}

interface SubscriptionFiltersProps {
  filters: SubscriptionFilters
  onFiltersChange: (filters: SubscriptionFilters) => void
  vehicles?: Array<{ id: string; name: string }>
}

export function SubscriptionFiltersComponent({
  filters,
  onFiltersChange,
  vehicles = [],
}: SubscriptionFiltersProps) {
  const updateFilter = (key: keyof SubscriptionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  return (
    <Card className="bg-card border-border shadow-xl sticky top-6">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-foreground text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="border-blue-600 bg-blue-950 text-blue-300">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            {filters.status && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('status', undefined)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger id="status" className="bg-muted border-border text-foreground">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
              <SelectItem value="committed" className="text-foreground">Committed</SelectItem>
              <SelectItem value="active" className="text-foreground">Active</SelectItem>
              <SelectItem value="closed" className="text-foreground">Closed</SelectItem>
              <SelectItem value="cancelled" className="text-foreground">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="vehicle" className="text-foreground">Vehicle</Label>
            {filters.vehicle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('vehicle', undefined)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.vehicle || undefined}
            onValueChange={(value) => updateFilter('vehicle', value)}
          >
            <SelectTrigger id="vehicle" className="bg-muted border-border text-foreground">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id} className="text-foreground">
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Investor Type Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="investorType" className="text-foreground">Investor Type</Label>
            {filters.investorType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('investorType', undefined)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.investorType || undefined}
            onValueChange={(value) => updateFilter('investorType', value)}
          >
            <SelectTrigger id="investorType" className="bg-muted border-border text-foreground">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              <SelectItem value="individual" className="text-foreground">Individual</SelectItem>
              <SelectItem value="entity" className="text-foreground">Entity</SelectItem>
              <SelectItem value="institutional" className="text-foreground">Institutional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commitment Range */}
        <div className="space-y-2">
          <Label className="text-foreground">Commitment Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minCommitment || ''}
              onChange={(e) => updateFilter('minCommitment', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-muted border-border text-foreground"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxCommitment || ''}
              onChange={(e) => updateFilter('maxCommitment', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-muted border-border text-foreground"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-foreground">Effective Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="bg-muted border-border text-foreground"
            />
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="bg-muted border-border text-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
