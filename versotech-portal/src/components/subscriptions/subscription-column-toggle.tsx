'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Columns3, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  required?: boolean
}

interface SubscriptionColumnToggleProps {
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
}

export function SubscriptionColumnToggle({
  columns,
  onColumnsChange,
}: SubscriptionColumnToggleProps) {
  const toggleColumn = (columnId: string) => {
    const updated = columns.map(col =>
      col.id === columnId && !col.required
        ? { ...col, visible: !col.visible }
        : col
    )
    onColumnsChange(updated)
  }

  const showAll = () => {
    const updated = columns.map(col => ({ ...col, visible: true }))
    onColumnsChange(updated)
  }

  const hideAll = () => {
    const updated = columns.map(col =>
      col.required ? col : { ...col, visible: false }
    )
    onColumnsChange(updated)
  }

  const resetToDefault = () => {
    const defaultVisibility = {
      select: true,
      subscription_number: true,
      investor: true,
      vehicle: true,
      commitment: true,
      status: true,
      committed_at: true,
      share_structure: false,
      fees: true,
      funded_amount: true,
      outstanding_amount: true,
      current_nav: true,
      opportunity_name: false,
      contract_date: false,
      performance_fees: false,
      created_at: false,
      actions: true,
    }

    const updated = columns.map(col => ({
      ...col,
      visible: defaultVisibility[col.id as keyof typeof defaultVisibility] ?? col.visible
    }))
    onColumnsChange(updated)
  }

  const visibleCount = columns.filter(col => col.visible).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Columns
          <Badge variant="secondary" className="ml-2">
            {visibleCount}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-gray-900 border-gray-700 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-white flex items-center justify-between">
          <span>Manage Columns</span>
          <span className="text-xs text-gray-400">{visibleCount} visible</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={showAll}
            className="w-full justify-start text-xs text-white hover:bg-gray-800"
          >
            <Eye className="h-3 w-3 mr-2" />
            Show All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={hideAll}
            className="w-full justify-start text-xs text-white hover:bg-gray-800"
          >
            <EyeOff className="h-3 w-3 mr-2" />
            Hide All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefault}
            className="w-full justify-start text-xs text-white hover:bg-gray-800"
          >
            <Columns3 className="h-3 w-3 mr-2" />
            Reset to Default
          </Button>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="max-h-64 overflow-y-auto scrollbar-hide">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.visible}
              onCheckedChange={() => toggleColumn(column.id)}
              disabled={column.required}
              className="text-white hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{column.label}</span>
                {column.required && (
                  <Badge variant="outline" className="ml-2 text-xs border-gray-600 text-gray-400">
                    Required
                  </Badge>
                )}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="p-2">
          <p className="text-xs text-gray-400 text-center">
            Column preferences saved automatically
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
