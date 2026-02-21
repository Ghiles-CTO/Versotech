'use client'

import { Table, List, Kanban } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ViewType = 'table' | 'kanban' | 'list'

interface ApprovalViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ApprovalViewSwitcher({
  currentView,
  onViewChange
}: ApprovalViewSwitcherProps) {
  const handleValueChange = (value: string) => {
    onViewChange(value as ViewType)
  }

  return (
    <Tabs value={currentView} onValueChange={handleValueChange}>
      <TabsList className="grid w-full grid-cols-3 max-w-sm">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          <span className="hidden sm:inline">Table</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          <span className="hidden sm:inline">Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
