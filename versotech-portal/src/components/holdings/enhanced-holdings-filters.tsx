'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  TrendingUp,
  TrendingDown,
  Building,
  Target,
  BarChart3,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react'

export interface FiltersState {
  search: string
  type: 'all' | 'fund' | 'spv' | 'real_estate' | 'deal'
  status: 'all' | 'active' | 'pending' | 'settled' | 'pending_review'
  performance: 'all' | 'positive' | 'negative' | 'breakeven'
  size: 'all' | 'large' | 'medium' | 'small'
  vintage: 'all' | 'recent' | 'mature' | 'legacy'
  domicile: 'all' | 'luxembourg' | 'ireland' | 'usa' | 'other'
}

export type SortOption = 
  | 'name_asc' | 'name_desc'
  | 'value_asc' | 'value_desc'
  | 'performance_asc' | 'performance_desc'
  | 'commitment_asc' | 'commitment_desc'
  | 'date_asc' | 'date_desc'

interface EnhancedHoldingsFiltersProps {
  filters: FiltersState
  sortBy: SortOption
  onFiltersChange: (filters: FiltersState) => void
  onSortChange: (sort: SortOption) => void
  totalCount: number
  filteredCount: number
  dealCount: number
  onClearFilters: () => void
  onRequestReport: () => void
}

const FILTER_OPTIONS = {
  type: [
    { value: 'all', label: 'All Types', icon: Building },
    { value: 'fund', label: 'Funds', icon: Building },
    { value: 'spv', label: 'SPVs', icon: Building },
    { value: 'real_estate', label: 'Real Estate', icon: Building },
    { value: 'deal', label: 'Deals', icon: Target }
  ],
  status: [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'settled', label: 'Settled' },
    { value: 'pending_review', label: 'Under Review' }
  ],
  performance: [
    { value: 'all', label: 'All Performance', icon: BarChart3 },
    { value: 'positive', label: 'Gains', icon: TrendingUp },
    { value: 'negative', label: 'Losses', icon: TrendingDown },
    { value: 'breakeven', label: 'Breakeven', icon: BarChart3 }
  ],
  size: [
    { value: 'all', label: 'All Sizes' },
    { value: 'large', label: 'Large (>$1M)' },
    { value: 'medium', label: 'Medium ($100K-$1M)' },
    { value: 'small', label: 'Small (<$100K)' }
  ],
  vintage: [
    { value: 'all', label: 'All Vintages', icon: Calendar },
    { value: 'recent', label: 'Recent (2023-2025)' },
    { value: 'mature', label: 'Mature (2018-2022)' },
    { value: 'legacy', label: 'Legacy (<2018)' }
  ],
  domicile: [
    { value: 'all', label: 'All Locations', icon: MapPin },
    { value: 'luxembourg', label: 'Luxembourg' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'usa', label: 'USA' },
    { value: 'other', label: 'Other' }
  ]
}

const SORT_OPTIONS = [
  { value: 'value_desc', label: 'Value (High to Low)', icon: SortDesc },
  { value: 'value_asc', label: 'Value (Low to High)', icon: SortAsc },
  { value: 'performance_desc', label: 'Performance (Best)', icon: TrendingUp },
  { value: 'performance_asc', label: 'Performance (Worst)', icon: TrendingDown },
  { value: 'name_asc', label: 'Name (A to Z)', icon: SortAsc },
  { value: 'name_desc', label: 'Name (Z to A)', icon: SortDesc },
  { value: 'commitment_desc', label: 'Commitment (High to Low)', icon: SortDesc },
  { value: 'date_desc', label: 'Latest First', icon: Calendar },
  { value: 'date_asc', label: 'Oldest First', icon: Calendar }
]

export function EnhancedHoldingsFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  totalCount,
  filteredCount,
  dealCount,
  onClearFilters,
  onRequestReport
}: EnhancedHoldingsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const updateFilter = (key: keyof FiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'search' && value !== 'all'
  ) || filters.search.length > 0

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'search' && value !== 'all'
  ).length + (filters.search.length > 0 ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Primary Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search vehicles and deals..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Type Filter */}
          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.type.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Performance Filter */}
          <Select value={filters.performance} onValueChange={(value) => updateFilter('performance', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Performance" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.performance.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={sortBy === option.value ? 'bg-blue-50 text-blue-700' : ''}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2 text-red-600 hover:text-red-700">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <Button onClick={onRequestReport} className="gap-2">
            <FileText className="h-4 w-4" />
            Portfolio Report
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {filteredCount !== totalCount 
              ? `${filteredCount} of ${totalCount} holdings`
              : `${totalCount} holdings`
            }
            {dealCount > 0 && (
              <span className="ml-2">• {dealCount} deals</span>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Advanced Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.status.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Position Size</label>
              <Select value={filters.size} onValueChange={(value) => updateFilter('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.size.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vintage Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vintage</label>
              <Select value={filters.vintage} onValueChange={(value) => updateFilter('vintage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.vintage.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domicile Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Domicile</label>
              <Select value={filters.domicile} onValueChange={(value) => updateFilter('domicile', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.domicile.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">Active filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{filters.search}"
                    <button onClick={() => updateFilter('search', '')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'search' || value === 'all') return null
                  const option = FILTER_OPTIONS[key as keyof typeof FILTER_OPTIONS]?.find(opt => opt.value === value)
                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {option?.label || value}
                      <button onClick={() => updateFilter(key as keyof FiltersState, 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
