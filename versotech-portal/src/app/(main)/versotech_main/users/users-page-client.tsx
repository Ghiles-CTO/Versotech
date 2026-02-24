'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  AlertCircle,
  Loader2,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Users,
  Building2,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  Upload,
  AlertTriangle,
  Key,
  Shield,
  PenTool,
  Link2,
  Lock,
  Unlock,
  ExternalLink,
  UserCheck,
  UserX
} from 'lucide-react'
import type { UserRow, UsersResponse, UsersStats, EntityAssociation } from './types'
import { ROLE_BADGE_CONFIG, ENTITY_TYPE_CONFIG, KYC_STATUS_CONFIG, DEFAULT_VISIBLE_COLUMNS, ALL_COLUMNS, REQUIRED_COLUMNS } from './types'

// Entity route mappings for navigating to entity detail pages
const ENTITY_ROUTES: Record<EntityAssociation['type'], string> = {
  investor: '/versotech_main/investors',
  partner: '/versotech_main/partners',
  lawyer: '/versotech_main/lawyers',
  commercial_partner: '/versotech_main/commercial-partners',
  introducer: '/versotech_main/introducers',
  arranger: '/versotech_main/arrangers'
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Helper function for relative time
function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

// KYC Status Badge Component
function KycStatusBadge({ kyc }: { kyc: UserRow['kyc'] }) {
  if (!kyc?.status) {
    return <span className="text-muted-foreground">—</span>
  }

  const config = KYC_STATUS_CONFIG[kyc.status]
  if (!config) {
    return <span className="text-muted-foreground">{kyc.status}</span>
  }

  const IconComponent = {
    check: CheckCircle2,
    clock: Clock,
    upload: Upload,
    x: XCircle,
    alert: AlertTriangle,
  }[config.icon]

  return (
    <div className="flex items-center gap-1.5">
      <IconComponent className={`h-4 w-4 ${config.className}`} />
      <span className={`text-xs ${config.className}`}>{config.label}</span>
      {kyc.idExpiryWarning && (
        <AlertTriangle className={`h-3 w-3 ${kyc.idExpiryWarning === 'expired' ? 'text-red-400' : 'text-orange-400'}`} />
      )}
    </div>
  )
}

// Entity List Popover Component
function EntityPopover({ entities }: { entities: EntityAssociation[] }) {
  if (entities.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto py-1 px-2">
          <span className="font-medium">{entities.length}</span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium">Entities ({entities.length})</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {entities.map((entity) => {
            const config = ENTITY_TYPE_CONFIG[entity.type]
            return (
              <div key={`${entity.type}-${entity.id}`} className="p-3 border-b last:border-0 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{entity.name}</span>
                  <Badge variant="outline" className={`text-xs ${config?.className || ''}`}>
                    {config?.label || entity.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{entity.role}</span>
                  {entity.isPrimary && (
                    <Badge variant="outline" className="text-xs py-0">Primary</Badge>
                  )}
                  {entity.canSign && (
                    <Badge variant="outline" className="text-xs py-0">Can Sign</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Stats Cards Component
function StatsCards({ stats, loading }: { stats: UsersStats | null; loading: boolean }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statItems = [
    { label: 'Total Users', value: stats.total, color: 'text-foreground' },
    { label: 'Active (30d)', value: stats.active, color: 'text-green-400' },
    { label: 'Staff', value: stats.staff, color: 'text-blue-400' },
    { label: 'Investors', value: stats.investors, color: 'text-emerald-400' },
    { label: 'Partners', value: stats.partners, color: 'text-cyan-400' },
    { label: 'Pending KYC', value: stats.pendingKyc, color: 'text-yellow-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map(item => (
        <Card key={item.label}>
          <CardContent className="pt-4">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function UsersPageClient() {
  const router = useRouter()

  // Data state
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState<UsersStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [kycStatusFilter, setKycStatusFilter] = useState<string>('all')

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalPages: 1,
    totalCount: 0
  })

  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const visibility: VisibilityState = {}
    ALL_COLUMNS.forEach(col => {
      visibility[col] = DEFAULT_VISIBLE_COLUMNS.includes(col)
    })
    return visibility
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Dialog state
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [isEntitiesDialogOpen, setIsEntitiesDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter }),
        ...(entityTypeFilter && entityTypeFilter !== 'all' && { entityType: entityTypeFilter }),
        ...(kycStatusFilter && kycStatusFilter !== 'all' && { kycStatus: kycStatusFilter }),
        sortBy: sorting[0]?.id || 'createdAt',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.data || [])
      setStats(data.stats || null)
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination!.totalPages,
          totalCount: data.pagination!.totalCount
        }))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users'
      console.error('[UsersPageClient] Error:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchQuery, roleFilter, entityTypeFilter, kycStatusFilter, sorting])

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchQuery, roleFilter, entityTypeFilter, kycStatusFilter])

  // Action handlers - wrapped in useCallback to ensure stable references for useMemo
  const handleViewEntities = useCallback((user: UserRow) => {
    setSelectedUser(user)
    setIsEntitiesDialogOpen(true)
  }, [])

  const handleResetPasswordClick = useCallback((user: UserRow) => {
    setSelectedUser(user)
    setIsResetPasswordDialogOpen(true)
  }, [])

  const handleDeactivateClick = useCallback((user: UserRow) => {
    setSelectedUser(user)
    setIsDeactivateDialogOpen(true)
  }, [])

  const handleReactivateClick = useCallback((user: UserRow) => {
    setSelectedUser(user)
    setIsReactivateDialogOpen(true)
  }, [])

  const handleResetPassword = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('Password reset email sent successfully')
        setIsResetPasswordDialogOpen(false)
        setSelectedUser(null)
      } else {
        toast.error(data?.error || 'Failed to send password reset email')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An error occurred while sending password reset email')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/deactivate`, {
        method: 'PATCH'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('User deactivated successfully')
        setIsDeactivateDialogOpen(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
      } else {
        toast.error(data?.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Deactivate error:', error)
      toast.error('An error occurred while deactivating user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reactivate`, {
        method: 'PATCH'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('User reactivated successfully')
        setIsReactivateDialogOpen(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
      } else {
        toast.error(data?.error || 'Failed to reactivate user')
      }
    } catch (error) {
      console.error('Reactivate error:', error)
      toast.error('An error occurred while reactivating user')
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk email handler
  const handleBulkEmail = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) return

    const emails = selectedRows.map(row => row.original.email).join(',')
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails)}`
  }

  // Export selected handler
  const handleExportSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) {
      handleExport() // Export all if none selected
      return
    }

    const headers = ['Name', 'Email', 'Role', 'Title', 'Entities', 'KYC Status', 'Last Login', 'Joined']
    const rows = selectedRows.map(row => {
      const u = row.original
      return [
        u.displayName,
        u.email,
        ROLE_BADGE_CONFIG[u.systemRole]?.label || u.systemRole,
        u.title || '',
        u.entityCount.toString(),
        u.kyc?.status || '',
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never',
        new Date(u.createdAt).toLocaleDateString()
      ]
    })

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-selected-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Define columns
  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
      size: 40,
    },
    {
      id: 'user',
      accessorKey: 'displayName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
              <AvatarFallback className="text-xs">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                {user.displayName}
                {user.isSuperAdmin && <Shield className="h-3.5 w-3.5 text-purple-400" />}
              </div>
              {user.title && <div className="text-xs text-muted-foreground">{user.title}</div>}
            </div>
          </div>
        )
      },
      size: 200,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
      ),
      size: 180,
    },
    {
      id: 'systemRole',
      accessorKey: 'systemRole',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original
        const isStaff = ['ceo', 'staff_admin', 'staff_ops', 'staff_rm'].includes(user.systemRole)
        const entityTypes = Array.from(new Set(user.entities.map(e => e.type)))

        // If staff role, show that first
        const badges: { label: string; className: string }[] = []
        if (isStaff) {
          const staffConfig = ROLE_BADGE_CONFIG[user.systemRole]
          if (staffConfig) badges.push(staffConfig)
        }
        // Add entity-derived persona badges
        for (const type of entityTypes) {
          const config = ENTITY_TYPE_CONFIG[type]
          if (config) badges.push(config)
        }
        // Fallback if no badges at all
        if (badges.length === 0) {
          const fallback = ROLE_BADGE_CONFIG[user.systemRole] || { label: user.systemRole, className: 'bg-gray-500/20 text-gray-400' }
          badges.push(fallback)
        }

        return (
          <div className="flex flex-wrap gap-1">
            {badges.map((b, i) => (
              <Badge key={i} variant="outline" className={`text-xs ${b.className}`}>
                {b.label}
              </Badge>
            ))}
          </div>
        )
      },
      size: 180,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className={row.original.title ? '' : 'text-muted-foreground'}>
          {row.original.title || '—'}
        </span>
      ),
      size: 150,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className={row.original.phone ? '' : 'text-muted-foreground'}>
          {row.original.phone || '—'}
        </span>
      ),
      size: 130,
    },
    {
      id: 'officeLocation',
      accessorKey: 'officeLocation',
      header: 'Office',
      cell: ({ row }) => (
        <span className={row.original.officeLocation ? '' : 'text-muted-foreground'}>
          {row.original.officeLocation || '—'}
        </span>
      ),
      size: 120,
    },
    {
      id: 'entities',
      accessorKey: 'entityCount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Entities
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => <EntityPopover entities={row.original.entities} />,
      size: 100,
    },
    {
      id: 'kyc',
      accessorKey: 'kyc',
      header: 'KYC',
      cell: ({ row }) => <KycStatusBadge kyc={row.original.kyc} />,
      size: 100,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Joined
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
      size: 100,
    },
    {
      id: 'lastLoginAt',
      accessorKey: 'lastLoginAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Active
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
           <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {getRelativeTime(row.original.lastLoginAt)}
        </span>
      ),
      size: 120,
    },
    {
      id: 'passwordSet',
      accessorKey: 'passwordSet',
      header: 'Password',
      cell: ({ row }) => (
        row.original.passwordSet
          ? <Key className="h-4 w-4 text-green-400" />
          : <Key className="h-4 w-4 text-muted-foreground/30" />
      ),
      size: 80,
    },
    {
      id: 'isSuperAdmin',
      accessorKey: 'isSuperAdmin',
      header: 'Super Admin',
      cell: ({ row }) => (
        row.original.isSuperAdmin
          ? <Shield className="h-4 w-4 text-purple-400" />
          : <span className="text-muted-foreground">—</span>
      ),
      size: 100,
    },
    {
      id: 'hasSignature',
      accessorKey: 'hasSignature',
      header: 'Signature',
      cell: ({ row }) => (
        row.original.hasSignature
          ? <PenTool className="h-4 w-4 text-green-400" />
          : <span className="text-muted-foreground">—</span>
      ),
      size: 90,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/versotech_main/users/${user.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                <Link2 className="mr-2 h-4 w-4" />
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.entities.length > 0 && (
                <DropdownMenuItem onClick={() => handleViewEntities(user)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  View Entities ({user.entities.length})
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleResetPasswordClick(user)} disabled={user.isDeleted}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              {user.isDeleted ? (
                <DropdownMenuItem
                  className="text-green-400"
                  onClick={() => handleReactivateClick(user)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-red-400"
                  onClick={() => handleDeactivateClick(user)}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
  ], [router, handleViewEntities, handleResetPasswordClick, handleDeactivateClick, handleReactivateClick])

  // Initialize table
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  })

  // Export to CSV
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Title', 'Entities', 'KYC Status', 'Last Login', 'Joined']
    const rows = users.map(u => [
      u.displayName,
      u.email,
      ROLE_BADGE_CONFIG[u.systemRole]?.label || u.systemRole,
      u.title || '',
      u.entityCount.toString(),
      u.kyc?.status || '',
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never',
      new Date(u.createdAt).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Column visibility toggle
  const ColumnToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(column => column.getCanHide())
          .map(column => {
            const isRequired = REQUIRED_COLUMNS.includes(column.id)
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                disabled={isRequired}
              >
                {column.id === 'systemRole' ? 'Role' : column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          const newVisibility: VisibilityState = {}
          ALL_COLUMNS.forEach(col => { newVisibility[col] = true })
          setColumnVisibility(newVisibility)
        }}>
          Show All
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const newVisibility: VisibilityState = {}
          ALL_COLUMNS.forEach(col => {
            newVisibility[col] = DEFAULT_VISIBLE_COLUMNS.includes(col)
          })
          setColumnVisibility(newVisibility)
        }}>
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Render error state
  if (error && !loading) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Users</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters - responsive: full width on mobile, fixed on desktop */}
            <div className="flex flex-wrap gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="staff_admin">Staff Admin</SelectItem>
                  <SelectItem value="staff_ops">Staff Ops</SelectItem>
                  <SelectItem value="staff_rm">Staff RM</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="introducer">Introducer</SelectItem>
                  <SelectItem value="arranger">Arranger</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entity Types</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="introducer">Introducer</SelectItem>
                  <SelectItem value="arranger">Arranger</SelectItem>
                </SelectContent>
              </Select>

              <Select value={kycStatusFilter} onValueChange={setKycStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <ColumnToggle />

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedCount > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{selectedCount} selected</span>
              <Button variant="outline" size="sm" onClick={handleBulkEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Bulk Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSelected}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Platform Users ({pagination.totalCount})
          </CardTitle>
          <CardDescription>
            All people with platform logins. For business entities, see the Accounts page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} users
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Entities Dialog */}
      <Dialog open={isEntitiesDialogOpen} onOpenChange={setIsEntitiesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Entity Associations</DialogTitle>
            <DialogDescription>
              {selectedUser?.displayName}&apos;s entity associations
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {selectedUser?.entities.map((entity) => {
              const config = ENTITY_TYPE_CONFIG[entity.type]
              const entityRoute = ENTITY_ROUTES[entity.type]
              return (
                <div
                  key={`${entity.type}-${entity.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entity.name}</span>
                      <Badge variant="outline" className={`text-xs ${config?.className || ''}`}>
                        {config?.label || entity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">{entity.role}</span>
                      {entity.isPrimary && (
                        <Badge variant="outline" className="text-xs py-0 bg-blue-500/10 text-blue-400 border-blue-500/30">
                          Primary
                        </Badge>
                      )}
                      {entity.canSign && (
                        <Badge variant="outline" className="text-xs py-0 bg-green-500/10 text-green-400 border-green-500/30">
                          Can Sign
                        </Badge>
                      )}
                    </div>
                  </div>
                  {entityRoute && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`${entityRoute}/${entity.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to <strong>{selectedUser?.email}</strong>.
              The user will need to click the link in the email to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Email'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{selectedUser?.displayName}</strong>?
              This user will no longer be able to access the platform.
              This action can be reversed by reactivating the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate <strong>{selectedUser?.displayName}</strong>?
              This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={actionLoading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reactivating...
                </>
              ) : (
                'Reactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
