'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Filter } from 'lucide-react'
import { ApprovalEntityType, ApprovalPriority } from '@/types/approvals'

export interface FilterState {
  entity_types: ApprovalEntityType[]
  priorities: ApprovalPriority[]
  assigned_to_me: boolean
  overdue_only: boolean
}

interface ApprovalFiltersProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
}

export function ApprovalFilters({ onFilterChange, currentFilters }: ApprovalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)

  const entityTypes: { value: ApprovalEntityType; label: string }[] = [
    { value: 'deal_commitment', label: 'Deal Commitments' },
    { value: 'deal_interest', label: 'Deal Interests' },
    { value: 'deal_subscription', label: 'Subscriptions' },
    { value: 'reservation', label: 'Reservations' },
    { value: 'allocation', label: 'Allocations' },
    { value: 'kyc_change', label: 'KYC Changes' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'profile_update', label: 'Profile Updates' },
    { value: 'document_access', label: 'Document Access' },
  ]

  const priorities: { value: ApprovalPriority; label: string; color: string }[] = [
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-blue-600' },
  ]

  const updateFilter = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      entity_types: [],
      priorities: [],
      assigned_to_me: false,
      overdue_only: false
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = 
    filters.entity_types.length + 
    filters.priorities.length + 
    (filters.assigned_to_me ? 1 : 0) + 
    (filters.overdue_only ? 1 : 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto" align="end" side="bottom">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3 text-sm">Request Type</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entityTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={filters.entity_types.includes(type.value)}
                    onCheckedChange={(checked) => {
                      updateFilter({
                        entity_types: checked
                          ? [...filters.entity_types, type.value]
                          : filters.entity_types.filter(t => t !== type.value)
                      })
                    }}
                  />
                  <Label 
                    htmlFor={type.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-sm">Priority</h4>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority.value}`}
                    checked={filters.priorities.includes(priority.value)}
                    onCheckedChange={(checked) => {
                      updateFilter({
                        priorities: checked
                          ? [...filters.priorities, priority.value]
                          : filters.priorities.filter(p => p !== priority.value)
                      })
                    }}
                  />
                  <Label 
                    htmlFor={`priority-${priority.value}`}
                    className={`text-sm font-normal cursor-pointer ${priority.color}`}
                  >
                    {priority.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assigned_to_me"
                checked={filters.assigned_to_me}
                onCheckedChange={(checked) =>
                  updateFilter({ assigned_to_me: checked as boolean })
                }
              />
              <Label 
                htmlFor="assigned_to_me"
                className="text-sm font-normal cursor-pointer"
              >
                Assigned to me only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue_only"
                checked={filters.overdue_only}
                onCheckedChange={(checked) =>
                  updateFilter({ overdue_only: checked as boolean })
                }
              />
              <Label 
                htmlFor="overdue_only"
                className="text-sm font-normal cursor-pointer"
              >
                Overdue only
              </Label>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
