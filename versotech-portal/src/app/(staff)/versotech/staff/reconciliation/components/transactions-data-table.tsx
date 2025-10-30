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
  getPaginationRowModel,
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
}

export function TransactionsDataTable<TData, TValue>({
  columns,
  data,
  pageSize = 25,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'value_date', desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  const currentPageRows = table.getRowModel().rows
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex + 1

  return (
    <div className="space-y-4">
      {/* Pagination Controls TOP */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/30 border-b border-gray-800">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-gray-200">{pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
          <span className="font-medium text-gray-200">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)}</span> of{' '}
          <span className="font-medium text-gray-200">{totalRows}</span> transactions
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="h-8 w-[100px] bg-gray-800/50 border-gray-700 text-gray-200">
              <SelectValue placeholder={`${pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="10" className="text-gray-200">10 rows</SelectItem>
              <SelectItem value="25" className="text-gray-200">25 rows</SelectItem>
              <SelectItem value="50" className="text-gray-200">50 rows</SelectItem>
              <SelectItem value="100" className="text-gray-200">100 rows</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-800 disabled:opacity-30"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-800 disabled:opacity-30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </Button>
            <div className="flex items-center gap-1 px-3">
              <span className="text-sm text-gray-400">
                Page <span className="font-medium text-gray-200">{currentPage}</span> of <span className="font-medium text-gray-200">{pageCount}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-800 disabled:opacity-30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-800 disabled:opacity-30"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-950/50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-800 bg-gray-900/50 hover:bg-gray-900/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-300 font-semibold">
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
            {currentPageRows.length ? (
              currentPageRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls BOTTOM */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/30 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Page {currentPage} of {pageCount}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  )
}
