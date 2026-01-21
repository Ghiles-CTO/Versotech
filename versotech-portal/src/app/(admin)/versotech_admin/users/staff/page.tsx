'use client'

import * as React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  MoreHorizontal,
  Eye,
  ArrowUpDown,
  Users as UsersIcon,
  Activity,
  UserCheck,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Staff member type based on API response
interface StaffMember {
  id: string
  email: string
  display_name: string
  role: string
  title: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  password_set: boolean
  status: 'invited' | 'active'
  permissions: string[]
  is_super_admin: boolean
  last_activity: string | null
  last_action: string | null
  recent_login_count: number
  recent_failed_logins: number
  assigned_investors: number
  activity_score_7d: number
}

interface StaffResponse {
  success: boolean
  data?: {
    staff_members: StaffMember[]
    statistics: {
      total_staff: number
      active_staff: number
      invited_staff: number
      super_admins: number
      by_role: Record<string, number>
    }
  }
  error?: string
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
  }
  return roleMap[role] || role
}

// Status badge styling (with dark mode support)
const statusBadgeStyle = (status: string): { variant: 'default' | 'secondary' | 'outline'; className?: string } => {
  if (status === 'active') {
    return { variant: 'default', className: 'bg-green-500 dark:bg-green-600 hover:bg-green-500/80 dark:hover:bg-green-600/80' }
  }
  // Invited
  return { variant: 'secondary', className: 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-500/80 dark:hover:bg-yellow-600/80' }
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

// Format permissions for display
const formatPermissions = (permissions: string[]): string => {
  if (permissions.length === 0) return 'None'
  const displayPermissions = permissions
    .filter(p => p !== 'super_admin')
    .map(p => p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
  if (displayPermissions.length === 0) return 'Super Admin'
  return displayPermissions.slice(0, 3).join(', ') + (displayPermissions.length > 3 ? ` +${displayPermissions.length - 3}` : '')
}

// Activity score color based on value (with dark mode support)
const getActivityScoreColor = (score: number): string => {
  if (score === 0) return 'text-muted-foreground'
  if (score < 10) return 'text-yellow-600 dark:text-yellow-500'
  if (score < 50) return 'text-blue-600 dark:text-blue-400'
  return 'text-green-600 dark:text-green-500'
}

// Staff action handlers type
interface StaffActionHandlers {
  onViewAssigned: (staff: StaffMember) => void
  onTransfer: (staff: StaffMember) => void
}

// Column definitions factory
const createColumns = (handlers: StaffActionHandlers): ColumnDef<StaffMember>[] => [
  {
    accessorKey: 'display_name',
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
      const staff = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={staff.display_name} />
            <AvatarFallback className="text-xs">
              {getInitials(staff.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/versotech_admin/users/${staff.id}`}
              className="font-medium hover:underline"
            >
              {staff.display_name}
            </Link>
            {staff.is_super_admin && (
              <span className="text-xs text-muted-foreground">Super Admin</span>
            )}
            {staff.title && !staff.is_super_admin && (
              <span className="text-xs text-muted-foreground">{staff.title}</span>
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
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role
      return (
        <Badge variant={roleBadgeVariant(role)}>
          {formatRole(role)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const permissions = row.original.permissions
      return (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate" title={permissions.join(', ')}>
          {formatPermissions(permissions)}
        </span>
      )
    },
  },
  {
    accessorKey: 'assigned_investors',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        <UserCheck className="mr-1 h-4 w-4" />
        Investors
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.assigned_investors
      return (
        <div className="flex items-center gap-1">
          <span className={cn('font-medium', count > 0 ? 'text-foreground' : 'text-muted-foreground')}>
            {count}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'activity_score_7d',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        <Activity className="mr-1 h-4 w-4" />
        Activity (7d)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = row.original.activity_score_7d
      return (
        <span className={cn('font-medium', getActivityScoreColor(score))}>
          {score}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const { variant, className } = statusBadgeStyle(status)
      return (
        <Badge variant={variant} className={className}>
          {status === 'active' ? 'Active' : 'Invited'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const staff = row.original
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
              <Link href={`/versotech_admin/users/${staff.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onViewAssigned(staff)}>
              <UserCheck className="mr-2 h-4 w-4" />
              View Assigned Investors
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onTransfer(staff)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transfer Assignments
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Loading skeleton
function StaffTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
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
      <h3 className="text-lg font-medium mb-1">No staff members found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        There are no staff members in the system yet. Invite staff members to get started.
      </p>
    </div>
  )
}

// Assigned investors type
interface AssignedInvestor {
  id: string
  name: string
  email: string
}

export default function StaffUsersPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'display_name', desc: false }
  ])
  const [statistics, setStatistics] = useState<StaffResponse['data']>()

  // Dialog states
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [viewAssignedDialogOpen, setViewAssignedDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [assignedInvestors, setAssignedInvestors] = useState<AssignedInvestor[]>([])
  const [loadingInvestors, setLoadingInvestors] = useState(false)
  const [targetStaffId, setTargetStaffId] = useState<string>('')
  const [isTransferring, setIsTransferring] = useState(false)

  // Fetch staff members
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/staff')
      const data: StaffResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch staff members')
      }

      setStaff(data.data?.staff_members || [])
      setStatistics(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  // Handler: View assigned investors
  const handleViewAssigned = useCallback(async (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setViewAssignedDialogOpen(true)
    setLoadingInvestors(true)

    try {
      const response = await fetch(`/api/admin/staff/${staffMember.id}/assigned-investors`)
      const data = await response.json()

      if (data.success && data.data) {
        setAssignedInvestors(data.data)
      } else {
        // If API doesn't exist yet, show empty list with message
        setAssignedInvestors([])
      }
    } catch (err) {
      setAssignedInvestors([])
    } finally {
      setLoadingInvestors(false)
    }
  }, [])

  // Handler: Open transfer dialog
  const handleTransfer = useCallback((staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setTargetStaffId('')
    setTransferDialogOpen(true)
  }, [])

  // Execute transfer
  const executeTransfer = useCallback(async () => {
    if (!selectedStaff || !targetStaffId) return

    setIsTransferring(true)
    try {
      const response = await fetch('/api/admin/staff/transfer-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStaffId: selectedStaff.id,
          toStaffId: targetStaffId,
        }),
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to transfer assignments')
      }

      toast.success('Assignments transferred', {
        description: `Investors reassigned from ${selectedStaff.display_name} successfully.`,
      })
      setTransferDialogOpen(false)
      fetchStaff() // Refresh data
    } catch (err) {
      toast.error('Failed to transfer', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsTransferring(false)
    }
  }, [selectedStaff, targetStaffId, fetchStaff])

  // Create columns with handlers
  const columns = useMemo(() => createColumns({
    onViewAssigned: handleViewAssigned,
    onTransfer: handleTransfer,
  }), [handleViewAssigned, handleTransfer])

  const table = useReactTable({
    data: staff,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    getRowId: (row) => row.id,
  })

  // Get other staff members for transfer dropdown
  const otherStaffMembers = useMemo(() => {
    return staff.filter(s => s.id !== selectedStaff?.id && s.role.startsWith('staff_'))
  }, [staff, selectedStaff])

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="font-medium text-destructive">Error loading staff</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchStaff()}
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
          <h1 className="text-2xl font-semibold">Staff Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage internal team members and their permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold">{statistics.statistics.total_staff}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{statistics.statistics.active_staff}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Invited</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.statistics.invited_staff}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Super Admins</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.statistics.super_admins}</p>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <StaffTableSkeleton />
      ) : staff.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
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
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Total Count */}
          <div className="text-sm text-muted-foreground">
            Showing {staff.length} staff member{staff.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* View Assigned Investors Dialog */}
      <Dialog open={viewAssignedDialogOpen} onOpenChange={setViewAssignedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigned Investors</DialogTitle>
            <DialogDescription>
              Investors assigned to {selectedStaff?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingInvestors ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : assignedInvestors.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No investors currently assigned
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {assignedInvestors.map((investor) => (
                  <Card key={investor.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {investor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{investor.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{investor.email}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAssignedDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Assignments Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Assignments</DialogTitle>
            <DialogDescription>
              Transfer all investor assignments from {selectedStaff?.display_name} to another staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-staff">Transfer to</Label>
              <Select value={targetStaffId} onValueChange={setTargetStaffId}>
                <SelectTrigger id="target-staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {otherStaffMembers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No other staff members available
                    </SelectItem>
                  ) : (
                    otherStaffMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.display_name}</span>
                          <span className="text-muted-foreground">({member.assigned_investors} assigned)</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> This will transfer all {selectedStaff?.assigned_investors || 0} investor assignments to the selected staff member.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeTransfer}
              disabled={!targetStaffId || isTransferring}
            >
              {isTransferring && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Transfer Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
