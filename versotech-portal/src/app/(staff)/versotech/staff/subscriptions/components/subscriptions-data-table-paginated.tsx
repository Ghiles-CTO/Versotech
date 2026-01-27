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
import { useTheme } from '@/components/theme-provider'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  pageSize?: number
}

export function SubscriptionsDataTablePaginated<TData, TValue>({
  columns,
  data,
  selectedIds,
  onSelectionChange,
  pageSize = 50, // DEFAULT TO 50 ROWS
}: DataTableProps<TData, TValue>) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  console.log('[PAGINATED TABLE] Rendering with', data.length, 'total rows, showing', pagination.pageSize, 'per page')

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // ADD PAGINATION
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  // Notify parent of selection changes (only for current page)
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => (row.original as any).id)
      onSelectionChange(selectedRowIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const currentPageRows = table.getRowModel().rows
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex + 1

  console.log('[PAGINATED TABLE] Current page:', currentPage, 'of', pageCount, ', showing', currentPageRows.length, 'rows')

  return (
    <div className="space-y-4">
      {/* Pagination Controls TOP */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)}</span> of{' '}
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{totalRows}</span> results
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
            }}
          >
            <SelectTrigger className={`h-8 w-[100px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}>
              <SelectValue placeholder={`${pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
              <SelectItem value="10" className={isDark ? 'text-gray-200' : 'text-gray-900'}>10 rows</SelectItem>
              <SelectItem value="25" className={isDark ? 'text-gray-200' : 'text-gray-900'}>25 rows</SelectItem>
              <SelectItem value="50" className={isDark ? 'text-gray-200' : 'text-gray-900'}>50 rows</SelectItem>
              <SelectItem value="100" className={isDark ? 'text-gray-200' : 'text-gray-900'}>100 rows</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </Button>
            <div className="flex items-center gap-1 px-3">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Page <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{currentPage}</span> of <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{pageCount}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table - NOW ONLY RENDERS CURRENT PAGE ROWS */}
      <div className={`rounded-lg overflow-x-auto overflow-y-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={`${isDark ? 'border-gray-800' : 'border-gray-200'} hover:bg-transparent`}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={`font-medium text-xs uppercase tracking-wider ${isDark ? 'text-gray-300 bg-gray-900/80' : 'text-gray-700 bg-gray-50'}`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {currentPageRows?.length ? (
              currentPageRows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`
                    ${isDark ? 'border-gray-800' : 'border-gray-200'} transition-all duration-150
                    ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} hover:shadow-sm
                    ${row.getIsSelected() ? (isDark ? 'bg-blue-900/10' : 'bg-blue-50') : ''}
                    ${index % 2 === 0 ? (isDark ? 'bg-gray-900/20' : 'bg-gray-50/50') : 'bg-transparent'}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`py-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
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
                  className={`h-32 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm">No subscriptions found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls BOTTOM */}
      <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="text-blue-500 font-medium">
              {table.getFilteredSelectedRowModel().rows.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              const pageNumber = i + 1
              const isCurrentPage = pageNumber === currentPage
              return (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={`
                    w-8 h-8 rounded text-sm font-medium transition-all
                    ${isCurrentPage
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  {pageNumber}
                </button>
              )
            })}
            {pageCount > 5 && <span className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>...</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`disabled:opacity-30 transition-all ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}