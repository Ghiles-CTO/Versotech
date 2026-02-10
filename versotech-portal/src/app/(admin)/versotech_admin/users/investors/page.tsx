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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Download,
  AlertTriangle,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { UserRow, UsersResponse } from '@/app/api/admin/users/route'

// Action handlers type
interface InvestorActionHandlers {
  onEdit: (user: UserRow) => void
  onLock: (user: UserRow) => void
  onResetPassword: (user: UserRow) => void
  onDeactivate: (user: UserRow) => void
}

// Filter option types
interface FilterOption {
  value: string
  label: string
}

// KYC status options (investor-specific)
const kycStatusOptions: FilterOption[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

const statusOptions: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deactivated', label: 'Deactivated' },
]

const hasEntitiesOptions: FilterOption[] = [
  { value: 'yes', label: 'Has Entities' },
  { value: 'no', label: 'No Entities' },
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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isActive = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo

  if (isActive) {
    return { variant: 'default', className: 'bg-green-500 dark:bg-green-600 hover:bg-green-500/80 dark:hover:bg-green-600/80' }
  }
  if (!user.lastLoginAt) {
    return { variant: 'secondary', className: 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-500/80 dark:hover:bg-yellow-600/80' }
  }
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

// Get initials from display name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Column definitions factory for investors
const createColumns = (handlers: InvestorActionHandlers): ColumnDef<UserRow>[] => [
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
        Investor
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
    accessorKey: 'entityCount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        <Building2 className="mr-1 h-4 w-4" />
        Entities
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.entityCount
      return (
        <Badge variant={count > 0 ? 'secondary' : 'outline'}>
          {count} {count === 1 ? 'entity' : 'entities'}
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
            <DropdownMenuItem onClick={() => handlers.onEdit(user)}>
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handlers.onLock(user)}
              className="text-yellow-600 dark:text-yellow-500"
            >
              <Lock className="mr-2 h-4 w-4" />
              Lock Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onResetPassword(user)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handlers.onDeactivate(user)}
              className="text-destructive"
            >
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
function InvestorsTableSkeleton() {
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
      <h3 className="text-lg font-medium mb-1">No investors found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        No investors match the current filters. Try adjusting your search or filter criteria.
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

export default function InvestorsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [statusFilters, setStatusFilters] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  )
  const [kycStatusFilters, setKycStatusFilters] = useState<string[]>(
    searchParams.get('kycStatus')?.split(',').filter(Boolean) || []
  )
  const [hasEntitiesFilter, setHasEntitiesFilter] = useState<string[]>(
    searchParams.get('hasEntities')?.split(',').filter(Boolean) || []
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
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  // Single user action states
  const [userToAction, setUserToAction] = useState<UserRow | null>(null)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [singleDeactivateDialogOpen, setSingleDeactivateDialogOpen] = useState(false)
  const [isPerformingAction, setIsPerformingAction] = useState(false)

  // Get selected users
  const selectedUsers = useMemo(() => {
    const selectedIds = Object.keys(rowSelection)
    return users.filter(user => selectedIds.includes(user.id))
  }, [rowSelection, users])

  // Export selected users as CSV
  const handleExportCSV = useCallback(() => {
    if (selectedUsers.length === 0) return

    const headers = ['ID', 'Name', 'Email', 'Entities', 'Status', 'Last Login', 'Created']
    const rows = selectedUsers.map(user => [
      user.id,
      user.displayName,
      user.email,
      user.entityCount,
      getStatusLabel(user),
      user.lastLoginAt || 'Never',
      user.createdAt,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `investors-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [selectedUsers])

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300)

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.length > 0 ||
      statusFilters.length > 0 ||
      kycStatusFilters.length > 0 ||
      hasEntitiesFilter.length > 0
    )
  }, [debouncedSearch, statusFilters, kycStatusFilters, hasEntitiesFilter])

  // Update URL params when filters change
  const updateUrlParams = useCallback((params: {
    search?: string
    status?: string[]
    kycStatus?: string[]
    hasEntities?: string[]
    page?: number
  }) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (params.search !== undefined) {
      if (params.search) {
        newParams.set('search', params.search)
      } else {
        newParams.delete('search')
      }
    }

    if (params.status !== undefined) {
      if (params.status.length > 0) {
        newParams.set('status', params.status.join(','))
      } else {
        newParams.delete('status')
      }
    }

    if (params.kycStatus !== undefined) {
      if (params.kycStatus.length > 0) {
        newParams.set('kycStatus', params.kycStatus.join(','))
      } else {
        newParams.delete('kycStatus')
      }
    }

    if (params.hasEntities !== undefined) {
      if (params.hasEntities.length > 0) {
        newParams.set('hasEntities', params.hasEntities.join(','))
      } else {
        newParams.delete('hasEntities')
      }
    }

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

  // Fetch users with investor filter
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
        entityType: 'investor',
      })

      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      }
      if (statusFilters.length > 0) {
        params.set('status', statusFilters.join(','))
      }
      if (kycStatusFilters.length > 0) {
        params.set('kycStatus', kycStatusFilters.join(','))
      }
      if (hasEntitiesFilter.length > 0) {
        params.set('hasEntities', hasEntitiesFilter.join(','))
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch investors')
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
  }, [pagination.pageSize, debouncedSearch, statusFilters, kycStatusFilters, hasEntitiesFilter])

  // Deactivate selected users
  const handleDeactivateUsers = useCallback(async () => {
    if (selectedUsers.length === 0) return

    setIsDeactivating(true)
    try {
      const response = await fetch('/api/admin/users/batch-deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers.map(u => u.id) }),
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to deactivate users')
      }

      setRowSelection({})
      setDeactivateDialogOpen(false)
      fetchUsers(pagination.page)
    } catch (error) {
      console.error('Failed to deactivate users:', error)
    } finally {
      setIsDeactivating(false)
    }
  }, [selectedUsers, fetchUsers, pagination.page])

  // Single user action handlers (wired to dropdown menu)
  const handleEditUser = useCallback((user: UserRow) => {
    // Navigate to user detail page for editing
    window.location.href = `/versotech_admin/users/${user.id}`
  }, [])

  const handleLockUser = useCallback((user: UserRow) => {
    setUserToAction(user)
    setLockDialogOpen(true)
  }, [])

  const handleResetPassword = useCallback((user: UserRow) => {
    setUserToAction(user)
    setResetPasswordDialogOpen(true)
  }, [])

  const handleDeactivateUser = useCallback((user: UserRow) => {
    setUserToAction(user)
    setSingleDeactivateDialogOpen(true)
  }, [])

  // Execute lock user
  const executeLockUser = useCallback(async () => {
    if (!userToAction) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userToAction.id}/toggle-lock`, {
        method: 'PATCH',
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to lock user')
      toast.success('Account locked', {
        description: `${userToAction.displayName}'s account has been locked.`,
      })
      setLockDialogOpen(false)
      setUserToAction(null)
      fetchUsers(pagination.page)
    } catch (error) {
      toast.error('Failed to lock account', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }, [userToAction, fetchUsers, pagination.page])

  // Execute reset password
  const executeResetPassword = useCallback(async () => {
    if (!userToAction) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userToAction.id}/reset-password`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to send password reset')
      toast.success('Password reset email sent', {
        description: `A password reset link has been sent to ${userToAction.email}.`,
      })
      setResetPasswordDialogOpen(false)
      setUserToAction(null)
    } catch (error) {
      toast.error('Failed to send password reset', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }, [userToAction])

  // Execute single user deactivate
  const executeSingleDeactivate = useCallback(async () => {
    if (!userToAction) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userToAction.id}/deactivate`, {
        method: 'PATCH',
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to deactivate user')
      toast.success('Investor deactivated', {
        description: `${userToAction.displayName} has been deactivated.`,
      })
      setSingleDeactivateDialogOpen(false)
      setUserToAction(null)
      fetchUsers(pagination.page)
    } catch (error) {
      toast.error('Failed to deactivate investor', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }, [userToAction, fetchUsers, pagination.page])

  // Create columns with action handlers
  const columns = useMemo(() => createColumns({
    onEdit: handleEditUser,
    onLock: handleLockUser,
    onResetPassword: handleResetPassword,
    onDeactivate: handleDeactivateUser,
  }), [handleEditUser, handleLockUser, handleResetPassword, handleDeactivateUser])

  // Fetch when filters change
  useEffect(() => {
    fetchUsers(1)
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilters,
      kycStatus: kycStatusFilters,
      hasEntities: hasEntitiesFilter,
      page: 1
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilters, kycStatusFilters, hasEntitiesFilter])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('')
    setStatusFilters([])
    setKycStatusFilters([])
    setHasEntitiesFilter([])
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

  const startIndex = (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.totalCount)

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="font-medium text-destructive">Error loading investors</h3>
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
          <h1 className="text-2xl font-semibold">Investors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage investor accounts and their entity associations
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
              placeholder="Search investors..."
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
              title="Status"
              options={statusOptions}
              selected={statusFilters}
              onSelect={setStatusFilters}
            />
            <MultiSelectFilter
              title="KYC Status"
              options={kycStatusOptions}
              selected={kycStatusFilters}
              onSelect={setKycStatusFilters}
            />
            <MultiSelectFilter
              title="Entities"
              options={hasEntitiesOptions}
              selected={hasEntitiesFilter}
              onSelect={setHasEntitiesFilter}
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
          {kycStatusFilters.map((status) => (
            <Badge key={status} variant="secondary" className="rounded-sm px-2 py-1">
              KYC: {kycStatusOptions.find(o => o.value === status)?.label || status}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setKycStatusFilters(kycStatusFilters.filter(s => s !== status))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {hasEntitiesFilter.map((value) => (
            <Badge key={value} variant="secondary" className="rounded-sm px-2 py-1">
              {hasEntitiesOptions.find(o => o.value === value)?.label || value}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setHasEntitiesFilter(hasEntitiesFilter.filter(v => v !== value))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <InvestorsTableSkeleton />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={cn("space-y-4", selectedUsers.length > 0 && "pb-20")}>
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
                      No investors found.
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
                <>Showing {startIndex}-{endIndex} of {pagination.totalCount} investors</>
              ) : (
                <>No investors found</>
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

      {/* Fixed Batch Action Bar */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
          <div className="flex items-center justify-between px-6 py-3 max-w-[calc(100%-var(--sidebar-width,16rem))] ml-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedUsers.length} investor{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeactivateDialogOpen(true)}
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deactivate Investors
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to deactivate {selectedUsers.length} investor{selectedUsers.length > 1 ? 's' : ''}?
                  They will no longer be able to access the platform.
                </p>
                <div className="rounded-md bg-muted p-3 max-h-32 overflow-y-auto">
                  <ul className="text-sm space-y-1">
                    {selectedUsers.slice(0, 10).map(user => (
                      <li key={user.id} className="flex items-center gap-2">
                        <span className="font-medium">{user.displayName}</span>
                        <span className="text-muted-foreground">({user.email})</span>
                      </li>
                    ))}
                    {selectedUsers.length > 10 && (
                      <li className="text-muted-foreground">
                        ...and {selectedUsers.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateUsers}
              disabled={isDeactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock User Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-600" />
              Lock Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to lock <strong>{userToAction?.displayName}</strong>&apos;s account?
              They will be temporarily unable to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeLockUser}
              disabled={isPerformingAction}
              className="bg-yellow-600 text-white hover:bg-yellow-600/90"
            >
              {isPerformingAction ? 'Locking...' : 'Lock Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset Password
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to <strong>{userToAction?.email}</strong>.
              The user will need to click the link in the email to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeResetPassword}
              disabled={isPerformingAction}
            >
              {isPerformingAction ? 'Sending...' : 'Send Reset Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single User Deactivate Dialog */}
      <AlertDialog open={singleDeactivateDialogOpen} onOpenChange={setSingleDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deactivate Investor
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{userToAction?.displayName}</strong>?
              They will no longer be able to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSingleDeactivate}
              disabled={isPerformingAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPerformingAction ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
