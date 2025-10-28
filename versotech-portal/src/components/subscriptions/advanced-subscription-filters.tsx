'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  X,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Clock
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type AdvancedSubscriptionFilters = {
  // Multi-select filters
  statuses?: string[]
  vehicleIds?: string[]
  investorIds?: string[]
  currencies?: string[]
  investorTypes?: string[]

  // Range filters
  commitmentMin?: number
  commitmentMax?: number
  fundedMin?: number
  fundedMax?: number
  outstandingMin?: number
  outstandingMax?: number
  navMin?: number
  navMax?: number

  // Date ranges
  effectiveDateFrom?: string
  effectiveDateTo?: string
  committedDateFrom?: string
  committedDateTo?: string
  fundingDueFrom?: string
  fundingDueTo?: string

  // Boolean filters
  hasPerformanceFees?: boolean
  hasIntroducer?: boolean
  hasOutstanding?: boolean
  isOverdue?: boolean

  // Search
  globalSearch?: string
  opportunitySearch?: string
}

interface AdvancedSubscriptionFiltersProps {
  filters: AdvancedSubscriptionFilters
  onFiltersChange: (filters: AdvancedSubscriptionFilters) => void
  vehicles?: Array<{ id: string; name: string }>
  investors?: Array<{ id: string; legal_name: string }>
  onSavePreset?: (name: string, filters: AdvancedSubscriptionFilters) => void
  savedPresets?: Array<{ name: string; filters: AdvancedSubscriptionFilters }>
  onLoadPreset?: (filters: AdvancedSubscriptionFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-900/30 text-yellow-300' },
  { value: 'committed', label: 'Committed', color: 'bg-blue-900/30 text-blue-300' },
  { value: 'active', label: 'Active', color: 'bg-green-900/30 text-green-300' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-800/50 text-gray-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-900/30 text-red-300' },
]

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'AUD', 'CAD']
const INVESTOR_TYPE_OPTIONS = ['individual', 'entity', 'institutional', 'fund']

export function AdvancedSubscriptionFilters({
  filters,
  onFiltersChange,
  vehicles = [],
  investors = [],
  onSavePreset,
  savedPresets = [],
  onLoadPreset
}: AdvancedSubscriptionFiltersProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    quickFilters: true,
    status: true,
    entities: true,
    amounts: false,
    dates: false,
    advanced: false,
  })

  const updateFilter = <K extends keyof AdvancedSubscriptionFilters>(
    key: K,
    value: AdvancedSubscriptionFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const toggleArrayFilter = (key: 'statuses' | 'vehicleIds' | 'investorIds' | 'currencies' | 'investorTypes', value: string) => {
    const current = filters[key] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]

    updateFilter(key, updated.length > 0 ? updated : undefined)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const applyQuickFilter = (preset: 'high_value' | 'overdue' | 'needs_funding' | 'active_performing') => {
    const presets = {
      high_value: {
        commitmentMin: 1000000,
        statuses: ['active', 'committed'],
      },
      overdue: {
        isOverdue: true,
        statuses: ['committed', 'active'],
      },
      needs_funding: {
        hasOutstanding: true,
        statuses: ['committed', 'active'],
      },
      active_performing: {
        statuses: ['active'],
        navMin: 0,
      },
    }

    onFiltersChange(presets[preset])
  }

  const activeFilterCount = Object.values(filters).filter(v => {
    if (Array.isArray(v)) return v.length > 0
    return v !== undefined && v !== ''
  }).length

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <Card className="bg-gray-900/70 border-gray-800 shadow-xl">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white text-lg">Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="border-blue-600 bg-blue-950 text-blue-300">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
        {/* Global Search */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-semibold">Search Everything</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search investor, vehicle, opportunity..."
              value={filters.globalSearch || ''}
              onChange={(e) => updateFilter('globalSearch', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white pl-10"
            />
          </div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Quick Filter Presets */}
        <Collapsible
          open={sectionsOpen.quickFilters}
          onOpenChange={() => toggleSection('quickFilters')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-white font-semibold">Quick Filters</span>
              </div>
              {sectionsOpen.quickFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('high_value')}
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <DollarSign className="h-3.5 w-3.5 mr-2 text-green-400" />
              High Value ($1M+)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('overdue')}
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <AlertCircle className="h-3.5 w-3.5 mr-2 text-red-400" />
              Overdue Funding
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('needs_funding')}
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <Clock className="h-3.5 w-3.5 mr-2 text-yellow-400" />
              Needs Funding
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('active_performing')}
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-2 text-blue-400" />
              Active & Performing
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-gray-800" />

        {/* Status Filter (Multi-select) */}
        <Collapsible
          open={sectionsOpen.status}
          onOpenChange={() => toggleSection('status')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Status</span>
                {filters.statuses && filters.statuses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.statuses.length}
                  </Badge>
                )}
              </div>
              {sectionsOpen.status ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {STATUS_OPTIONS.map(status => (
              <div key={status.value} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.statuses?.includes(status.value)}
                  onCheckedChange={() => toggleArrayFilter('statuses', status.value)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="flex-1 cursor-pointer"
                >
                  <Badge className={`${status.color} border-0`}>
                    {status.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-gray-800" />

        {/* Vehicles & Investors */}
        <Collapsible
          open={sectionsOpen.entities}
          onOpenChange={() => toggleSection('entities')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Vehicles & Investors</span>
                {((filters.vehicleIds?.length || 0) + (filters.investorIds?.length || 0)) > 0 && (
                  <Badge variant="secondary">
                    {(filters.vehicleIds?.length || 0) + (filters.investorIds?.length || 0)}
                  </Badge>
                )}
              </div>
              {sectionsOpen.entities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            {/* Vehicles Multi-select */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Vehicles</Label>
              <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-1 bg-gray-800/50 rounded p-2">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`vehicle-${vehicle.id}`}
                      checked={filters.vehicleIds?.includes(vehicle.id)}
                      onCheckedChange={() => toggleArrayFilter('vehicleIds', vehicle.id)}
                      className="border-gray-600"
                    />
                    <Label
                      htmlFor={`vehicle-${vehicle.id}`}
                      className="flex-1 cursor-pointer text-sm text-white"
                    >
                      {vehicle.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Investor Types */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Investor Types</Label>
              <div className="space-y-1">
                {INVESTOR_TYPE_OPTIONS.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`investor-type-${type}`}
                      checked={filters.investorTypes?.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('investorTypes', type)}
                      className="border-gray-600"
                    />
                    <Label
                      htmlFor={`investor-type-${type}`}
                      className="flex-1 cursor-pointer text-sm text-white capitalize"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-gray-800" />

        {/* Amount Ranges */}
        <Collapsible
          open={sectionsOpen.amounts}
          onOpenChange={() => toggleSection('amounts')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <span className="text-white font-semibold">Amount Ranges</span>
              {sectionsOpen.amounts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            {/* Commitment Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Commitment</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.commitmentMin || ''}
                  onChange={(e) => updateFilter('commitmentMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.commitmentMax || ''}
                  onChange={(e) => updateFilter('commitmentMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>

            {/* Funded Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Funded Amount</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.fundedMin || ''}
                  onChange={(e) => updateFilter('fundedMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.fundedMax || ''}
                  onChange={(e) => updateFilter('fundedMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>

            {/* NAV Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Current NAV</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.navMin || ''}
                  onChange={(e) => updateFilter('navMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.navMax || ''}
                  onChange={(e) => updateFilter('navMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-gray-800" />

        {/* Date Ranges */}
        <Collapsible
          open={sectionsOpen.dates}
          onOpenChange={() => toggleSection('dates')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <span className="text-white font-semibold">Date Ranges</span>
              {sectionsOpen.dates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            {/* Effective Date Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Effective Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.effectiveDateFrom || ''}
                  onChange={(e) => updateFilter('effectiveDateFrom', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="date"
                  value={filters.effectiveDateTo || ''}
                  onChange={(e) => updateFilter('effectiveDateTo', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>

            {/* Committed Date Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Committed Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.committedDateFrom || ''}
                  onChange={(e) => updateFilter('committedDateFrom', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="date"
                  value={filters.committedDateTo || ''}
                  onChange={(e) => updateFilter('committedDateTo', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>

            {/* Funding Due Date Range */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Funding Due Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.fundingDueFrom || ''}
                  onChange={(e) => updateFilter('fundingDueFrom', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Input
                  type="date"
                  value={filters.fundingDueTo || ''}
                  onChange={(e) => updateFilter('fundingDueTo', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-gray-800" />

        {/* Advanced Boolean Filters */}
        <Collapsible
          open={sectionsOpen.advanced}
          onOpenChange={() => toggleSection('advanced')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <span className="text-white font-semibold">Advanced Filters</span>
              {sectionsOpen.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has-performance-fees"
                checked={filters.hasPerformanceFees}
                onCheckedChange={(checked) => updateFilter('hasPerformanceFees', checked as boolean)}
                className="border-gray-600"
              />
              <Label htmlFor="has-performance-fees" className="text-white text-sm cursor-pointer">
                Has Performance Fees
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="has-introducer"
                checked={filters.hasIntroducer}
                onCheckedChange={(checked) => updateFilter('hasIntroducer', checked as boolean)}
                className="border-gray-600"
              />
              <Label htmlFor="has-introducer" className="text-white text-sm cursor-pointer">
                Has Introducer
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="has-outstanding"
                checked={filters.hasOutstanding}
                onCheckedChange={(checked) => updateFilter('hasOutstanding', checked as boolean)}
                className="border-gray-600"
              />
              <Label htmlFor="has-outstanding" className="text-white text-sm cursor-pointer">
                Has Outstanding Amount
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is-overdue"
                checked={filters.isOverdue}
                onCheckedChange={(checked) => updateFilter('isOverdue', checked as boolean)}
                className="border-gray-600"
              />
              <Label htmlFor="is-overdue" className="text-white text-sm cursor-pointer">
                Funding Overdue
              </Label>
            </div>

            {/* Currency Filter */}
            <div className="space-y-2 mt-3">
              <Label className="text-white text-xs">Currency</Label>
              <div className="flex flex-wrap gap-1">
                {CURRENCY_OPTIONS.map(currency => (
                  <Badge
                    key={currency}
                    variant="outline"
                    className={`cursor-pointer ${
                      filters.currencies?.includes(currency)
                        ? 'bg-blue-900/50 border-blue-500 text-blue-200'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                    onClick={() => toggleArrayFilter('currencies', currency)}
                  >
                    {currency}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
