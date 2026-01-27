'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Search, DollarSign } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export type SimpleFilters = {
  search?: string
  statuses?: string[]
  commitmentMin?: number
  commitmentMax?: number
}

interface FilterPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: SimpleFilters
  onApply: (filters: SimpleFilters) => void
  vehicles?: Array<{ id: string; name: string }>
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', darkColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', lightColor: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'committed', label: 'Committed', darkColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50', lightColor: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'active', label: 'Active', darkColor: 'bg-green-500/20 text-green-300 border-green-500/50', lightColor: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'closed', label: 'Closed', darkColor: 'bg-gray-500/20 text-gray-300 border-gray-500/50', lightColor: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'cancelled', label: 'Cancelled', darkColor: 'bg-red-500/20 text-red-300 border-red-500/50', lightColor: 'bg-red-100 text-red-700 border-red-300' },
]

export function FilterPopup({ open, onOpenChange, filters, onApply }: FilterPopupProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [localFilters, setLocalFilters] = useState<SimpleFilters>(filters)

  const handleApply = () => {
    onApply(localFilters)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalFilters({})
    onApply({})
    onOpenChange(false)
  }

  const toggleStatus = (status: string) => {
    const current = localFilters.statuses || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]

    setLocalFilters(prev => ({
      ...prev,
      statuses: updated.length > 0 ? updated : undefined
    }))
  }

  const activeFilterCount = [
    localFilters.search,
    localFilters.statuses?.length,
    localFilters.commitmentMin,
    localFilters.commitmentMax,
  ].filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center justify-between text-xl",
            isDark ? "text-white" : "text-gray-900"
          )}>
            <span>Filter Subscriptions</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", isDark ? "text-gray-200" : "text-gray-700")}>Search</Label>
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
              <Input
                placeholder="Search by number, investor, or vehicle..."
                value={localFilters.search || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                className={cn(
                  "pl-10",
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                )}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", isDark ? "text-gray-200" : "text-gray-700")}>Status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(status => (
                <Badge
                  key={status.value}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    localFilters.statuses?.includes(status.value)
                      ? (isDark ? status.darkColor : status.lightColor)
                      : (isDark ? 'bg-gray-800 text-gray-400 border-gray-600 hover:border-gray-500' : 'bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400')
                  )}
                  onClick={() => toggleStatus(status.value)}
                >
                  {localFilters.statuses?.includes(status.value) && (
                    <span className="mr-1">✓</span>
                  )}
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Commitment Range */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", isDark ? "text-gray-200" : "text-gray-700")}>Commitment Amount</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.commitmentMin || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    commitmentMin: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className={cn(
                    "pl-10",
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  )}
                />
              </div>
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>to</span>
              <div className="relative flex-1">
                <DollarSign className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.commitmentMax || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    commitmentMax: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className={cn(
                    "pl-10",
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={isDark
                ? "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                : "bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100"
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}