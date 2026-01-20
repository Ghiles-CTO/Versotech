'use client'

import * as React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Eye,
  UserX,
  Lock,
  KeyRound,
  ArrowUpDown,
  Users as UsersIcon,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { UserRow, UsersResponse } from '@/app/api/admin/users/route'

// Filter option types
interface FilterOption {
  value: string
  label: string
}

// Filter options
const roleOptions: FilterOption[] = [
  { value: 'investor', label: 'Investor' },
  { value: 'staff_admin', label: 'Staff Admin' },
  { value: 'staff_ops', label: 'Staff Ops' },
  { value: 'staff_rm', label: 'Staff RM' },
  { value: 'ceo', label: 'CEO' },
]

const statusOptions: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deactivated', label: 'Deactivated' },
]

const entityTypeOptions: FilterOption[] = [
  { value: 'investor', label: 'Investor' },
  { value: 'arranger', label: 'Arranger' },
  { value: 'introducer', label: 'Introducer' },
  { value: 'partner', label: 'Partner' },
  { value: 'lawyer', label: 'Lawyer' },
]

// Multi-select filter component
interface MultiSelectFilterProps {
  title: string
  options: FilterOption[]
  selected: string[]
  onSelect: (values: string[]) => void
  className?: string
}

function MultiSelectFilter({
  title,
  options,
  selected,
  onSelect,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelect(selected.filter(v => v !== value))
    } else {
      onSelect([...selected, value])
    }
  }

  const clearSelection = () => {
    onSelect([])
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 border-dashed',
            selected.length > 0 && 'border-primary',
            className
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {selected.length}
              </Badge>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearSelection}
                    className="justify-center text-center"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Status badge color mapping
const statusBadgeVariant = (user: UserRow): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } => {
  if (user.isDeleted) {
    return { variant: 'destructive' }
  }
  // Active = logged in within last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isActive = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo

  if (isActive) {
    return { variant: 'default', className: 'bg-green-500 hover:bg-green-500/80' }
  }
  // Pending = never logged in
  if (!user.lastLoginAt) {
    return { variant: 'secondary', className: 'bg-yellow-500 text-white hover:bg-yellow-500/80' }
  }
  // Inactive = not active recently
  return { variant: 'outline' }
}

const getStatusLabel = (user: UserRow): string => {
  if (user.isDeleted) return 'Deactivated'
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isActive = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo
  if (isActive) return 'Active'
  if (!user.lastLoginAt) return 'Pending'
  return 'Inactive'
}

// Role badge variant
const roleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
  if (role === 'ceo') return 'default'
  if (role.startsWith('staff_')) return 'secondary'
  return 'outline'
}

const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    ceo: 'CEO',
    staff_admin: 'Staff Admin',
    staff_ops: 'Staff Ops',
    staff_rm: 'Staff RM',
    investor: 'Investor',
  }
  return roleMap[role] || role
}

// Get initials from display name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Column definitions
const columns: ColumnDef<UserRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'displayName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
            <AvatarFallback className="text-xs">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/versotech_admin/users/${user.id}`}
              className="font-medium hover:underline"
            >
              {user.displayName}
            </Link>
            {user.isSuperAdmin && (
              <span className="text-xs text-muted-foreground">Super Admin</span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: 'systemRole',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.systemRole
      return (
        <Badge variant={roleBadgeVariant(role)}>
          {formatRole(role)}
        </Badge>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const user = row.original
      const { variant, className } = statusBadgeVariant(user)
      return (
        <Badge variant={variant} className={className}>
          {getStatusLabel(user)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Last Active
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const lastLogin = row.original.lastLoginAt
      if (!lastLogin) {
        return <span className="text-muted-foreground">Never</span>
      }
      return (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(lastLogin), { addSuffix: true })}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/versotech_admin/users/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-yellow-600">
              <Lock className="mr-2 h-4 w-4" />
              Lock Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Loading skeleton
function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <UsersIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No users found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        No users match the current filters. Try adjusting your search or filter criteria.
      </p>
    </div>
  )
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function UsersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [roleFilters, setRoleFilters] = useState<string[]>(
    searchParams.get('role')?.split(',').filter(Boolean) || []
  )
  const [statusFilters, setStatusFilters] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  )
  const [entityTypeFilters, setEntityTypeFilters] = useState<string[]>(
    searchParams.get('entityType')?.split(',').filter(Boolean) || []
  )

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalPages: 1,
    totalCount: 0,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300)

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.length > 0 ||
      roleFilters.length > 0 ||
      statusFilters.length > 0 ||
      entityTypeFilters.length > 0
    )
  }, [debouncedSearch, roleFilters, statusFilters, entityTypeFilters])

  // Update URL params when filters change
  const updateUrlParams = useCallback((params: {
    search?: string
    role?: string[]
    status?: string[]
    entityType?: string[]
    page?: number
  }) => {
    const newParams = new URLSearchParams(searchParams.toString())

    // Handle search
    if (params.search !== undefined) {
      if (params.search) {
        newParams.set('search', params.search)
      } else {
        newParams.delete('search')
      }
    }

    // Handle role filter
    if (params.role !== undefined) {
      if (params.role.length > 0) {
        newParams.set('role', params.role.join(','))
      } else {
        newParams.delete('role')
      }
    }

    // Handle status filter
    if (params.status !== undefined) {
      if (params.status.length > 0) {
        newParams.set('status', params.status.join(','))
      } else {
        newParams.delete('status')
      }
    }

    // Handle entity type filter
    if (params.entityType !== undefined) {
      if (params.entityType.length > 0) {
        newParams.set('entityType', params.entityType.join(','))
      } else {
        newParams.delete('entityType')
      }
    }

    // Handle page
    if (params.page !== undefined) {
      if (params.page > 1) {
        newParams.set('page', params.page.toString())
      } else {
        newParams.delete('page')
      }
    }

    const queryString = newParams.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }, [pathname, router, searchParams])

  // Fetch users with filters
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      // Add filters to API request
      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      }
      if (roleFilters.length > 0) {
        params.set('role', roleFilters.join(','))
      }
      if (statusFilters.length > 0) {
        params.set('status', statusFilters.join(','))
      }
      if (entityTypeFilters.length > 0) {
        params.set('entityType', entityTypeFilters.join(','))
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.data || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize, debouncedSearch, roleFilters, statusFilters, entityTypeFilters])

  // Fetch when filters change
  useEffect(() => {
    fetchUsers(1)
    // Reset to page 1 when filters change
    updateUrlParams({
      search: debouncedSearch,
      role: roleFilters,
      status: statusFilters,
      entityType: entityTypeFilters,
      page: 1
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilters, statusFilters, entityTypeFilters])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('')
    setRoleFilters([])
    setStatusFilters([])
    setEntityTypeFilters([])
  }

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    getRowId: (row) => row.id,
  })

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      const newPage = pagination.page - 1
      fetchUsers(newPage)
      updateUrlParams({ page: newPage })
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      const newPage = pagination.page + 1
      fetchUsers(newPage)
      updateUrlParams({ page: newPage })
    }
  }

  // Calculate display range
  const startIndex = (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.totalCount)

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="font-medium text-destructive">Error loading users</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchUsers()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">All Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform users and their access
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setSearchInput('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <MultiSelectFilter
              title="Role"
              options={roleOptions}
              selected={roleFilters}
              onSelect={setRoleFilters}
            />
            <MultiSelectFilter
              title="Status"
              options={statusOptions}
              selected={statusFilters}
              onSelect={setStatusFilters}
            />
            <MultiSelectFilter
              title="Entity Type"
              options={entityTypeOptions}
              selected={entityTypeFilters}
              onSelect={setEntityTypeFilters}
            />
          </div>
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {debouncedSearch && (
            <Badge variant="secondary" className="rounded-sm px-2 py-1">
              Search: &quot;{debouncedSearch}&quot;
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setSearchInput('')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {roleFilters.map((role) => (
            <Badge key={role} variant="secondary" className="rounded-sm px-2 py-1">
              Role: {roleOptions.find(o => o.value === role)?.label || role}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setRoleFilters(roleFilters.filter(r => r !== role))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {statusFilters.map((status) => (
            <Badge key={status} variant="secondary" className="rounded-sm px-2 py-1">
              Status: {statusOptions.find(o => o.value === status)?.label || status}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setStatusFilters(statusFilters.filter(s => s !== status))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {entityTypeFilters.map((entityType) => (
            <Badge key={entityType} variant="secondary" className="rounded-sm px-2 py-1">
              Entity: {entityTypeOptions.find(o => o.value === entityType)?.label || entityType}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setEntityTypeFilters(entityTypeFilters.filter(e => e !== entityType))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <UsersTableSkeleton />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Selection Info */}
          {Object.keys(rowSelection).length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {Object.keys(rowSelection).length} of {users.length} row(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRowSelection({})}
                className="ml-auto"
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-24 text-center"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {pagination.totalCount > 0 ? (
                <>Showing {startIndex}-{endIndex} of {pagination.totalCount} users</>
              ) : (
                <>No users found</>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground px-2">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
