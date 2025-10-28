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
    <Card className="bg-gray-900/70 border-gray-800 shadow-xl sticky top-6">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white text-lg">Filters</CardTitle>
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
              className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
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
            <Label htmlFor="status" className="text-white">Status</Label>
            {filters.status && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('status', undefined)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger id="status" className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="pending" className="text-white">Pending</SelectItem>
              <SelectItem value="committed" className="text-white">Committed</SelectItem>
              <SelectItem value="active" className="text-white">Active</SelectItem>
              <SelectItem value="closed" className="text-white">Closed</SelectItem>
              <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="vehicle" className="text-white">Vehicle</Label>
            {filters.vehicle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('vehicle', undefined)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.vehicle || undefined}
            onValueChange={(value) => updateFilter('vehicle', value)}
          >
            <SelectTrigger id="vehicle" className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id} className="text-white">
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Investor Type Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="investorType" className="text-white">Investor Type</Label>
            {filters.investorType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('investorType', undefined)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.investorType || undefined}
            onValueChange={(value) => updateFilter('investorType', value)}
          >
            <SelectTrigger id="investorType" className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="individual" className="text-white">Individual</SelectItem>
              <SelectItem value="entity" className="text-white">Entity</SelectItem>
              <SelectItem value="institutional" className="text-white">Institutional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commitment Range */}
        <div className="space-y-2">
          <Label className="text-white">Commitment Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minCommitment || ''}
              onChange={(e) => updateFilter('minCommitment', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxCommitment || ''}
              onChange={(e) => updateFilter('maxCommitment', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-white">Effective Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
