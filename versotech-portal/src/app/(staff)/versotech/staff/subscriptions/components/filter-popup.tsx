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
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
  { value: 'committed', label: 'Committed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
  { value: 'active', label: 'Active', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-300 border-red-500/50' },
]

export function FilterPopup({ open, onOpenChange, filters, onApply }: FilterPopupProps) {
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
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
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
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by number, investor, or vehicle..."
                value={localFilters.search || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(status => (
                <Badge
                  key={status.value}
                  variant="outline"
                  className={`cursor-pointer transition-all ${
                    localFilters.statuses?.includes(status.value)
                      ? status.color
                      : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-gray-500'
                  }`}
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
            <Label className="text-sm font-medium">Commitment Amount</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.commitmentMin || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    commitmentMin: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <span className="text-gray-400">to</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.commitmentMax || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    commitmentMax: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-400 hover:text-white"
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
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