'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Building2,
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar,
  DollarSign,
  BarChart3,
  Sparkles,
  Check
} from 'lucide-react'

export interface FiltersState {
  search: string
  type: string
  status: string
  performance: string
  size: string
  vintage: string
  domicile: string
  // New advanced filters
  minValue?: number
  maxValue?: number
  minReturn?: number
  maxReturn?: number
  sectors?: string[]
  tags?: string[]
}

export type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'value_asc' 
  | 'value_desc' 
  | 'performance_asc' 
  | 'performance_desc'
  | 'commitment_asc'
  | 'commitment_desc'
  | 'date_asc'
  | 'date_desc'

interface ModernHoldingsFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  onClearFilters: () => void
  activeFiltersCount: number
  totalResults?: number
  className?: string
}

const typeOptions = [
  { value: 'all', label: 'All Types', icon: Building2 },
  { value: 'fund', label: 'Funds', icon: Building2 },
  { value: 'spv', label: 'SPVs', icon: Building2 },
  { value: 'co_investment', label: 'Co-Investments', icon: Building2 },
  { value: 'direct', label: 'Direct Investments', icon: Building2 }
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'closed', label: 'Closed', color: 'gray' }
]

const performanceOptions = [
  { value: 'all', label: 'All Performance', icon: BarChart3 },
  { value: 'positive', label: 'Positive Returns', icon: TrendingUp, color: 'green' },
  { value: 'negative', label: 'Negative Returns', icon: TrendingDown, color: 'red' },
  { value: 'breakeven', label: 'Break Even', icon: BarChart3, color: 'gray' }
]

const sizeOptions = [
  { value: 'all', label: 'All Sizes' },
  { value: 'large', label: 'Large (>$1M)', icon: DollarSign },
  { value: 'medium', label: 'Medium ($100K-$1M)', icon: DollarSign },
  { value: 'small', label: 'Small (<$100K)', icon: DollarSign }
]

const vintageOptions = [
  { value: 'all', label: 'All Vintages' },
  { value: 'recent', label: 'Recent (< 2 years)', icon: Calendar },
  { value: 'mature', label: 'Mature (2-5 years)', icon: Calendar },
  { value: 'legacy', label: 'Legacy (> 5 years)', icon: Calendar }
]

const domicileOptions = [
  { value: 'all', label: 'All Locations' },
  { value: 'luxembourg', label: 'Luxembourg', flag: '🇱🇺' },
  { value: 'british virgin islands', label: 'British Virgin Islands', flag: '🇻🇬' },
  { value: 'cayman islands', label: 'Cayman Islands', flag: '🇰🇾' },
  { value: 'united states', label: 'United States', flag: '🇺🇸' },
  { value: 'singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'other', label: 'Other', flag: '🌍' }
]

const sortOptions: { value: SortOption; label: string; icon?: React.ElementType }[] = [
  { value: 'value_desc', label: 'Highest Value', icon: TrendingUp },
  { value: 'value_asc', label: 'Lowest Value', icon: TrendingDown },
  { value: 'performance_desc', label: 'Best Performance', icon: TrendingUp },
  { value: 'performance_asc', label: 'Worst Performance', icon: TrendingDown },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'date_desc', label: 'Newest First', icon: Calendar },
  { value: 'date_asc', label: 'Oldest First', icon: Calendar },
  { value: 'commitment_desc', label: 'Largest Commitment', icon: DollarSign },
  { value: 'commitment_asc', label: 'Smallest Commitment', icon: DollarSign }
]

export function ModernHoldingsFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  onClearFilters,
  activeFiltersCount,
  totalResults = 0,
  className
}: ModernHoldingsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [valueRange, setValueRange] = useState<[number, number]>([0, 10000000])
  const [returnRange, setReturnRange] = useState<[number, number]>([-50, 100])

  const handleFilterChange = (key: keyof FiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, type, or location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="w-[160px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Performance Filter */}
          <Select value={filters.performance} onValueChange={(value) => handleFilterChange('performance', value)}>
            <SelectTrigger className="w-[160px]">
              <BarChart3 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Performance" />
            </SelectTrigger>
            <SelectContent>
              {performanceOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    {option.icon && <option.icon className={cn("h-4 w-4 mr-2", option.color === 'green' && 'text-green-600', option.color === 'red' && 'text-red-600')} />}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Size Filter */}
          <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
            <SelectTrigger className="w-[140px]">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Advanced
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvancedFilters && "rotate-180")} />
          </Button>

          {/* Sort Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSort.icon && <currentSort.icon className="h-4 w-4" />}
                {currentSort.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <Command>
                <CommandInput placeholder="Search sort options..." />
                <CommandList>
                  <CommandEmpty>No sort option found.</CommandEmpty>
                  <CommandGroup>
                    {sortOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => onSortChange(option.value)}
                      >
                        <div className="flex items-center w-full">
                          {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                          <span className="flex-1">{option.label}</span>
                          {sortBy === option.value && <Check className="h-4 w-4" />}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.color && (
                          <div className={cn(
                            "h-2 w-2 rounded-full mr-2",
                            option.color === 'green' && 'bg-green-500',
                            option.color === 'yellow' && 'bg-yellow-500',
                            option.color === 'gray' && 'bg-gray-500'
                          )} />
                        )}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vintage Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vintage</Label>
              <Select value={filters.vintage} onValueChange={(value) => handleFilterChange('vintage', value)}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select vintage" />
                </SelectTrigger>
                <SelectContent>
                  {vintageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domicile Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Domicile</Label>
              <Select value={filters.domicile} onValueChange={(value) => handleFilterChange('domicile', value)}>
                <SelectTrigger>
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {domicileOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{option.flag}</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Value Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${(valueRange[0] / 1000).toFixed(0)}K - ${(valueRange[1] / 1000).toFixed(0)}K
                </span>
              </div>
              <Slider
                value={valueRange}
                onValueChange={setValueRange}
                max={10000000}
                step={100000}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Return Range</Label>
                <span className="text-sm text-muted-foreground">
                  {returnRange[0]}% - {returnRange[1]}%
                </span>
              </div>
              <Slider
                value={returnRange}
                onValueChange={setReturnRange}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
            {totalResults > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm font-medium">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
