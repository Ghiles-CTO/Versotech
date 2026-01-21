'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Users, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Cohort {
  cohortName: string
  size: number
  activationRate: number
  investmentRate: number
  avgInvestment: number
  avgTimeToFirstInvestment: number | null
  retention30d: number
  retention60d: number
  retention90d: number
}

interface CohortsDataTableProps {
  groupBy: string
}

// Format currency values
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

// Get retention color class based on percentage
function getRetentionColorClass(value: number): string {
  if (value === -1) return 'text-muted-foreground'
  if (value >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// Get rate color class based on percentage
function getRateColorClass(value: number): string {
  if (value >= 50) return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 25) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// Format retention display
function formatRetention(value: number): string {
  if (value === -1) return 'N/A'
  return `${value}%`
}

export function CohortsDataTable({ groupBy }: CohortsDataTableProps) {
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/cohorts?groupBy=${groupBy}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cohort data')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setCohorts(result.data.cohorts)
        } else {
          throw new Error(result.error || 'No data available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [groupBy])

  const columns: ColumnDef<Cohort>[] = useMemo(
    () => [
      {
        accessorKey: 'cohortName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Cohort
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('cohortName')}</div>
        ),
      },
      {
        accessorKey: 'size',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Size
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{(row.getValue('size') as number).toLocaleString()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'activationRate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Activation
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('activationRate') as number
          return (
            <span className={getRateColorClass(value)}>{value}%</span>
          )
        },
      },
      {
        accessorKey: 'investmentRate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Investment Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('investmentRate') as number
          return (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={getRateColorClass(value)}>{value}%</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'avgInvestment',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Avg Investment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('avgInvestment') as number
          return (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{value > 0 ? formatCurrency(value) : '-'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'avgTimeToFirstInvestment',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Days to Invest
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('avgTimeToFirstInvestment') as number | null
          return (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{value !== null ? `${value} days` : '-'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'retention30d',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4 whitespace-nowrap"
          >
            30d Retention
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('retention30d') as number
          return (
            <span className={getRetentionColorClass(value)}>
              {formatRetention(value)}
            </span>
          )
        },
      },
      {
        accessorKey: 'retention60d',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4 whitespace-nowrap"
          >
            60d Retention
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('retention60d') as number
          return (
            <span className={getRetentionColorClass(value)}>
              {formatRetention(value)}
            </span>
          )
        },
      },
      {
        accessorKey: 'retention90d',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4 whitespace-nowrap"
          >
            90d Retention
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.getValue('retention90d') as number
          return (
            <span className={getRetentionColorClass(value)}>
              {formatRetention(value)}
            </span>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: cohorts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-9 gap-4 pb-2 border-b">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
            {/* Data rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-9 gap-4 py-3">
                {Array.from({ length: 9 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-14" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort Analysis</CardTitle>
          <CardDescription>
            Failed to load cohort data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!cohorts || cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort Analysis</CardTitle>
          <CardDescription>
            User cohort metrics and retention analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Cohort Data</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              There are no users in the selected grouping yet. Try selecting a different cohort grouping.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate summary stats
  const totalUsers = cohorts.reduce((sum, c) => sum + c.size, 0)
  const avgActivation = cohorts.reduce((sum, c) => sum + c.activationRate, 0) / cohorts.length
  const avgInvestmentRate = cohorts.reduce((sum, c) => sum + c.investmentRate, 0) / cohorts.length

  return (
    <div className="space-y-4">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="h-4 w-4" />
            Total Users
          </div>
          <div className="text-2xl font-bold mt-1">{totalUsers.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">across {cohorts.length} cohorts</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            Avg Activation Rate
          </div>
          <div className={cn('text-2xl font-bold mt-1', getRateColorClass(avgActivation))}>
            {avgActivation.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">profile completed</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <DollarSign className="h-4 w-4" />
            Avg Investment Rate
          </div>
          <div className={cn('text-2xl font-bold mt-1', getRateColorClass(avgInvestmentRate))}>
            {avgInvestmentRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">made an investment</div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort Metrics</CardTitle>
          <CardDescription>
            Click column headers to sort. Retention shows user activity at 30/60/90 days after joining.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
