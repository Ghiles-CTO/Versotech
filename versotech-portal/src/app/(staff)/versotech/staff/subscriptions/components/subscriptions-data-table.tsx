'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onBulkUpdate?: (ids: string[], updates: Record<string, any>) => Promise<void>
}

export function SubscriptionsDataTable<TData, TValue>({
  columns,
  data,
  selectedIds,
  onSelectionChange,
  onBulkUpdate,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [bulkAction, setBulkAction] = React.useState('')
  const [isApplyingBulk, setIsApplyingBulk] = React.useState(false)

  // Sync row selection with parent selectedIds
  React.useEffect(() => {
    if (selectedIds && data) {
      const selectionMap: Record<string, boolean> = {}
      data.forEach((row: any, index) => {
        if (selectedIds.includes(row.id)) {
          selectionMap[index] = true
        }
      })
      setRowSelection(selectionMap)
    }
  }, [selectedIds, data])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const displayedRows = table.getRowModel().rows

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => (row.original as any).id)
      onSelectionChange(selectedRowIds)
    }
  }, [rowSelection, onSelectionChange, table])

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCount === 0) {
      toast.error('Please select rows and an action')
      return
    }

    if (!onBulkUpdate) {
      toast.error('Bulk actions not available')
      return
    }

    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => (row.original as any).id)

    let updates: Record<string, any> = {}

    switch (bulkAction) {
      case 'activate':
        updates = { status: 'active' }
        break
      case 'close':
        updates = { status: 'closed' }
        break
      case 'set_pending':
        updates = { status: 'pending' }
        break
      case 'set_committed':
        updates = { status: 'committed' }
        break
      case 'export':
        toast.info('Export functionality coming soon')
        return
      default:
        toast.error('Invalid action')
        return
    }

    try {
      setIsApplyingBulk(true)
      await onBulkUpdate(selectedIds, updates)
      toast.success(`Updated ${selectedCount} subscription(s)`)
      table.toggleAllPageRowsSelected(false)
      setBulkAction('')
    } catch (error) {
      toast.error('Failed to apply bulk action')
      console.error('Bulk action error:', error)
    } finally {
      setIsApplyingBulk(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-950 rounded-lg border border-blue-800">
          <span className="text-sm font-medium text-blue-100">
            {selectedCount} of {totalCount} row(s) selected
          </span>

          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Choose action..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="activate" className="text-white">Set to Active</SelectItem>
              <SelectItem value="set_committed" className="text-white">Set to Committed</SelectItem>
              <SelectItem value="set_pending" className="text-white">Set to Pending</SelectItem>
              <SelectItem value="close" className="text-white">Close Subscriptions</SelectItem>
              <SelectItem value="export" className="text-white">Export Selected</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleBulkAction}
            disabled={!bulkAction || isApplyingBulk}
            size="sm"
            className="bg-white text-black hover:bg-gray-200"
          >
            {isApplyingBulk ? 'Applying...' : 'Apply'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="ml-auto text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-white bg-gray-900">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {displayedRows?.length ? (
              displayedRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-800/50 border-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-white">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  No subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
