'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Icons
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  UserX,
  UserCheck,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  Mail,
  User,
  Briefcase,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Calendar,
  Clock,
  Loader2,
  Building2,
  Activity,
  Users,
  Scale,
  Handshake,
  Globe,
  Landmark,
  Plus,
  Trash2,
  Search,
  X,
  Download,
  FileText,
  Filter,
  ChevronDown,
  History,
  MonitorSmartphone,
  Power,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Table Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Types
import type { UserRow, EntityAssociation } from '@/app/api/admin/users/route'
import type { SingleUserResponse } from '@/app/api/admin/users/[id]/route'
import type { ActivityLogItem, ActivityResponse } from '@/app/api/admin/users/[id]/activity/route'

// Entity type to icon mapping
const entityTypeIcons: Record<EntityAssociation['type'], LucideIcon> = {
  investor: Building2,
  partner: Users,
  lawyer: Scale,
  commercial_partner: Handshake,
  introducer: Globe,
  arranger: Landmark,
}

// Entity type display names
const entityTypeLabels: Record<EntityAssociation['type'], string> = {
  investor: 'Investor',
  partner: 'Partner',
  lawyer: 'Law Firm',
  commercial_partner: 'Commercial Partner',
  introducer: 'Introducer',
  arranger: 'Arranger',
}

// Edit form schema
const editUserSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters'),
  title: z.string().max(100, 'Title must be less than 100 characters').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone must be less than 50 characters').optional().or(z.literal('')),
  office_location: z.string().max(100, 'Office location must be less than 100 characters').optional().or(z.literal('')),
})

type EditUserFormData = z.infer<typeof editUserSchema>

// Helper functions for badges (same as users list)
const getStatusLabel = (user: UserRow): string => {
  if (user.isDeleted) return 'Deactivated'
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isActive = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo
  if (isActive) return 'Active'
  if (!user.lastLoginAt) return 'Pending'
  return 'Inactive'
}

const statusBadgeVariant = (user: UserRow): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } => {
  if (user.isDeleted) {
    return { variant: 'destructive' }
  }
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isActive = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo

  if (isActive) {
    return { variant: 'default', className: 'bg-green-500 hover:bg-green-500/80' }
  }
  if (!user.lastLoginAt) {
    return { variant: 'secondary', className: 'bg-yellow-500 text-white hover:bg-yellow-500/80' }
  }
  return { variant: 'outline' }
}

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

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Loading skeleton for header
function UserHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action states
  const [isPerformingAction, setIsPerformingAction] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  // Entity management state
  const [removeEntityDialogOpen, setRemoveEntityDialogOpen] = useState(false)
  const [entityToRemove, setEntityToRemove] = useState<EntityAssociation | null>(null)
  const [isRemovingEntity, setIsRemovingEntity] = useState(false)

  // Activity tab state
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityHasMore, setActivityHasMore] = useState(false)
  const [activityTotal, setActivityTotal] = useState(0)
  const [activityOffset, setActivityOffset] = useState(0)
  const [activityActionTypes, setActivityActionTypes] = useState<string[]>([])
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [activityInitialized, setActivityInitialized] = useState(false)

  // Security tab state
  const [securityInitialized, setSecurityInitialized] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [failedLoginCount, setFailedLoginCount] = useState(0)
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null)
  const [revokeSessionsDialogOpen, setRevokeSessionsDialogOpen] = useState(false)
  const [isRevokingSessions, setIsRevokingSessions] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [isTogglingLock, setIsTogglingLock] = useState(false)

  // Active tab state for auto-loading
  const [activeTab, setActiveTab] = useState('profile')

  // Edit form
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      display_name: '',
      title: '',
      phone: '',
      office_location: '',
    },
  })

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/users/${userId}`)
      const data: SingleUserResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user')
      }

      setUser(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId, fetchUser])

  // Fetch activity logs
  const fetchActivity = useCallback(async (reset: boolean = false) => {
    try {
      setActivityLoading(true)
      const currentOffset = reset ? 0 : activityOffset
      const filterParam = activityFilter !== 'all' ? `&action=${encodeURIComponent(activityFilter)}` : ''

      const response = await fetch(
        `/api/admin/users/${userId}/activity?offset=${currentOffset}&limit=20${filterParam}`
      )
      const data: ActivityResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch activity')
      }

      if (reset) {
        setActivityLogs(data.data.logs)
        setActivityOffset(20)
      } else {
        setActivityLogs(prev => [...prev, ...data.data!.logs])
        setActivityOffset(prev => prev + 20)
      }

      setActivityHasMore(data.data.hasMore)
      setActivityTotal(data.data.total)
      setActivityActionTypes(data.data.actionTypes)
      setActivityInitialized(true)
    } catch (err) {
      console.error('Failed to fetch activity:', err)
      toast.error('Failed to load activity', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setActivityLoading(false)
    }
  }, [userId, activityOffset, activityFilter])

  // Format action for display
  const formatActionDescription = (log: ActivityLogItem): string => {
    // Create human-readable descriptions based on action type
    const actionMap: Record<string, string> = {
      'LOGIN': 'Logged in',
      'LOGOUT': 'Logged out',
      'VIEW': 'Viewed',
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted',
      'APPROVE': 'Approved',
      'REJECT': 'Rejected',
      'SUBMIT': 'Submitted',
      'DOWNLOAD': 'Downloaded',
      'UPLOAD': 'Uploaded',
      'SIGN': 'Signed',
      'INVITE': 'Invited',
    }

    // Try to match action parts
    const parts = log.rawAction.split('_')
    const verb = parts[0]
    const subject = parts.slice(1).join(' ').toLowerCase()

    const mappedVerb = actionMap[verb] || log.action

    if (log.entity_type) {
      return `${mappedVerb} ${log.entity_type.replace(/_/g, ' ')}`
    }

    return subject ? `${mappedVerb} ${subject}` : mappedVerb
  }

  // Export activity as CSV
  const handleExportActivityCSV = () => {
    if (activityLogs.length === 0) return

    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'IP Address']
    const rows = activityLogs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.action,
      log.entity_type || '',
      log.entity_id || '',
      log.ip_address || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${user?.displayName || 'user'}_activity_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Activity exported', {
      description: `${activityLogs.length} activities exported to CSV`,
    })
  }

  // Handle activity filter change
  const handleActivityFilterChange = (value: string) => {
    setActivityFilter(value)
    setActivityOffset(0)
  }

  // Fetch security data (sessions, failed logins)
  const fetchSecurityData = useCallback(async () => {
    try {
      setSecurityLoading(true)

      // Fetch activity logs to derive session count and failed logins
      // Session count: count of LOGIN actions (approximate active sessions)
      // Failed logins: count of failed login attempts in last 24 hours
      const response = await fetch(
        `/api/admin/users/${userId}/activity?limit=1000&action=LOGIN`
      )
      const data: ActivityResponse = await response.json()

      if (data.success && data.data) {
        // Count unique sessions (LOGIN actions in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentLogins = data.data.logs.filter(
          log => new Date(log.timestamp) > thirtyDaysAgo
        )
        setSessionCount(recentLogins.length)
      }

      // Fetch failed login attempts (typically logged as LOGIN_FAILED)
      const failedResponse = await fetch(
        `/api/admin/users/${userId}/activity?limit=100&action=LOGIN_FAILED`
      )
      const failedData: ActivityResponse = await failedResponse.json()

      if (failedData.success && failedData.data) {
        // Count failed logins in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentFailures = failedData.data.logs.filter(
          log => new Date(log.timestamp) > oneDayAgo
        )
        setFailedLoginCount(recentFailures.length)
      }

      // Check for password change event
      const pwdResponse = await fetch(
        `/api/admin/users/${userId}/activity?limit=1&action=PASSWORD_CHANGED`
      )
      const pwdData: ActivityResponse = await pwdResponse.json()

      if (pwdData.success && pwdData.data && pwdData.data.logs.length > 0) {
        setLastPasswordChange(pwdData.data.logs[0].timestamp)
      }

      setSecurityInitialized(true)
    } catch (err) {
      console.error('Failed to fetch security data:', err)
    } finally {
      setSecurityLoading(false)
    }
  }, [userId])

  // Handle Account Status toggle (Active/Inactive)
  const handleStatusToggle = async (checked: boolean) => {
    if (!user) return
    setIsTogglingStatus(true)
    try {
      const endpoint = checked
        ? `/api/admin/users/${userId}/reactivate`
        : `/api/admin/users/${userId}/deactivate`

      const response = await fetch(endpoint, { method: 'PATCH' })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success(checked ? 'User activated' : 'User deactivated', {
        description: checked
          ? `${user.displayName} can now access the platform.`
          : `${user.displayName} can no longer access the platform.`,
      })
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to update status', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Handle Account Lock toggle
  const handleLockToggle = async () => {
    if (!user) return
    setIsTogglingLock(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-lock`, {
        method: 'PATCH',
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle lock status')
      }

      const isNowLocked = data.data?.is_locked
      toast.success(isNowLocked ? 'Account locked' : 'Account unlocked', {
        description: isNowLocked
          ? `${user.displayName}'s account has been locked.`
          : `${user.displayName}'s account has been unlocked.`,
      })
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to toggle lock status', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsTogglingLock(false)
    }
  }

  // Handle Revoke All Sessions
  const handleRevokeSessions = async () => {
    if (!user) return
    setIsRevokingSessions(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/revoke-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to revoke sessions')
      }

      toast.success('Sessions revoked', {
        description: `All active sessions for ${user.displayName} have been terminated.`,
      })
      setRevokeSessionsDialogOpen(false)
      setSessionCount(0) // Reset count after revocation
    } catch (err) {
      toast.error('Failed to revoke sessions', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsRevokingSessions(false)
    }
  }

  // Re-fetch activity when filter changes
  useEffect(() => {
    if (activityInitialized) {
      fetchActivity(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityFilter])

  // Handle tab change with auto-loading
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)

    // Auto-load activity data when switching to activity tab
    if (value === 'activity' && !activityInitialized && !activityLoading) {
      fetchActivity(true)
    }

    // Auto-load security data when switching to security tab
    if (value === 'security' && !securityInitialized && !securityLoading) {
      fetchSecurityData()
    }
  }, [activityInitialized, activityLoading, fetchActivity, securityInitialized, securityLoading, fetchSecurityData])

  // Action handlers
  const handleDeactivate = async () => {
    if (!user) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to deactivate user')
      }

      toast.success('User deactivated', {
        description: `${user.displayName} has been deactivated and can no longer access the platform.`,
      })
      setDeactivateDialogOpen(false)
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to deactivate user', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleReactivate = async () => {
    if (!user) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'PATCH',
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to reactivate user')
      }

      toast.success('User reactivated', {
        description: `${user.displayName} has been reactivated and can now access the platform.`,
      })
      setReactivateDialogOpen(false)
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to reactivate user', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleToggleLock = async () => {
    if (!user) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-lock`, {
        method: 'PATCH',
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update lock status')
      }

      const isNowLocked = data.data?.is_locked
      toast.success(isNowLocked ? 'User locked' : 'User unlocked', {
        description: isNowLocked
          ? `${user.displayName} has been locked and cannot access the platform.`
          : `${user.displayName} has been unlocked and can now access the platform.`,
      })
      setLockDialogOpen(false)
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to update lock status', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    setIsPerformingAction(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to send password reset')
      }

      toast.success('Password reset email sent', {
        description: `A password reset link has been sent to ${user.email}.`,
      })
      setResetPasswordDialogOpen(false)
    } catch (err) {
      toast.error('Failed to send password reset', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsPerformingAction(false)
    }
  }

  // Open edit dialog and populate form
  const handleOpenEditDialog = () => {
    if (user) {
      resetForm({
        display_name: user.displayName || '',
        title: user.title || '',
        phone: user.phone || '',
        office_location: user.officeLocation || '',
      })
      setEditDialogOpen(true)
    }
  }

  // Submit edit form
  const handleEditSubmit = async (data: EditUserFormData) => {
    setIsSubmittingEdit(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: data.display_name,
          title: data.title || null,
          phone: data.phone || null,
          office_location: data.office_location || null,
        }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user')
      }

      toast.success('Profile updated', {
        description: 'User profile has been updated successfully.',
      })
      setEditDialogOpen(false)
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to update profile', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Handle remove entity
  const handleRemoveEntity = async () => {
    if (!entityToRemove || !user) return
    setIsRemovingEntity(true)
    try {
      const response = await fetch(
        `/api/admin/users/${userId}/entities/${entityToRemove.id}?type=${entityToRemove.type}`,
        { method: 'DELETE' }
      )
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove entity')
      }

      toast.success('Entity removed', {
        description: `${entityToRemove.name} has been unlinked from ${user.displayName}.`,
      })
      setRemoveEntityDialogOpen(false)
      setEntityToRemove(null)
      fetchUser() // Refresh data
    } catch (err) {
      toast.error('Failed to remove entity', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setIsRemovingEntity(false)
    }
  }

  // Open remove entity dialog
  const openRemoveEntityDialog = (entity: EntityAssociation) => {
    setEntityToRemove(entity)
    setRemoveEntityDialogOpen(true)
  }

  if (error) {
    return (
      <div className="p-6">
        {/* Back link */}
        <Link
          href="/versotech_admin/users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Link>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h3 className="font-medium text-destructive">Error loading user</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchUser()}>
              Try Again
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/versotech_admin/users')}>
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/versotech_admin/users"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Users
      </Link>

      {/* User Header */}
      {loading ? (
        <UserHeaderSkeleton />
      ) : user ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                <AvatarFallback className="text-xl font-medium">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">{user.displayName}</h1>
                    {user.isSuperAdmin && (
                      <Badge variant="default" className="bg-purple-500 hover:bg-purple-500/80">
                        Super Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const { variant, className } = statusBadgeVariant(user)
                    return (
                      <Badge variant={variant} className={className}>
                        {getStatusLabel(user)}
                      </Badge>
                    )
                  })()}
                  <Badge variant={roleBadgeVariant(user.systemRole)}>
                    {formatRole(user.systemRole)}
                  </Badge>
                  {user.entityCount > 0 && (
                    <Badge variant="outline">
                      {user.entityCount} {user.entityCount === 1 ? 'Entity' : 'Entities'}
                    </Badge>
                  )}
                </div>

                {/* Last seen */}
                <p className="text-sm text-muted-foreground">
                  {user.lastLoginAt ? (
                    <>Last seen: {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}</>
                  ) : (
                    <>Never logged in</>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleOpenEditDialog}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Deactivate / Reactivate */}
                    {user.isDeleted ? (
                      <DropdownMenuItem
                        onClick={() => setReactivateDialogOpen(true)}
                        className="text-green-600"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Reactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setDeactivateDialogOpen(true)}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    )}

                    {/* Lock / Unlock */}
                    <DropdownMenuItem
                      onClick={() => setLockDialogOpen(true)}
                      className="text-yellow-600"
                    >
                      {user.isDeleted ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Reset Password */}
                    <DropdownMenuItem
                      onClick={() => setResetPasswordDialogOpen(true)}
                      disabled={user.isDeleted}
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tab Navigation */}
      {user && !loading && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Entities</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="font-medium">{user.displayName || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.phone || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {user.title || '—'}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Office Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {user.officeLocation || '—'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">System Role</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleBadgeVariant(user.systemRole)}>
                      {formatRole(user.systemRole)}
                    </Badge>
                    {user.isSuperAdmin && (
                      <Badge variant="default" className="bg-purple-500 hover:bg-purple-500/80">
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">MFA Status</p>
                  <p className="font-medium flex items-center gap-2">
                    {user.passwordSet ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Enabled</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Not Configured</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {user.lastLoginAt ? (
                      <>
                        {format(new Date(user.lastLoginAt), 'MMM d, yyyy')}
                        <span className="text-sm text-muted-foreground">
                          ({formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })})
                        </span>
                      </>
                    ) : (
                      'Never logged in'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Linked Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.entities.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No linked entities</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      This user is not associated with any entities. Entity associations are created during the invitation process.
                    </p>
                  </div>
                ) : (
                  /* Entities Table */
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Type</TableHead>
                          <TableHead>Entity Name</TableHead>
                          <TableHead>Entity Type</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.entities.map((entity) => {
                          const EntityIcon = entityTypeIcons[entity.type]
                          return (
                            <TableRow key={`${entity.type}-${entity.id}`}>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <EntityIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {entity.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {entityTypeLabels[entity.type]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={entity.isPrimary ? 'default' : 'secondary'}
                                >
                                  {entity.isPrimary ? 'Primary' : 'Member'}
                                </Badge>
                                {entity.canSign && (
                                  <Badge variant="outline" className="ml-2">
                                    Can Sign
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => openRemoveEntityDialog(entity)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove entity</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity History
                  {activityTotal > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activityTotal} {activityTotal === 1 ? 'event' : 'events'}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Action Type Filter */}
                  <Select
                    value={activityFilter}
                    onValueChange={handleActivityFilterChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {activityActionTypes.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Export CSV Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportActivityCSV}
                    disabled={activityLogs.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Initial Loading State - Load activity on first view */}
                {!activityInitialized && !activityLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Button
                      variant="outline"
                      onClick={() => fetchActivity(true)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Load Activity
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {activityLoading && activityLogs.length === 0 && (
                  <div className="space-y-4 py-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {activityInitialized && activityLogs.length === 0 && !activityLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No activity recorded</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {activityFilter !== 'all'
                        ? `No "${activityFilter.replace(/_/g, ' ')}" actions found. Try selecting a different filter.`
                        : 'This user has no recorded activity in the system.'}
                    </p>
                    {activityFilter !== 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setActivityFilter('all')}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                )}

                {/* Activity Timeline */}
                {activityLogs.length > 0 && (
                  <div className="space-y-1">
                    {/* Timeline */}
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                      {activityLogs.map((log, index) => (
                        <div
                          key={log.id}
                          className="relative flex items-start gap-4 py-4 first:pt-0"
                        >
                          {/* Timeline dot */}
                          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-border">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <p className="font-medium text-sm">
                                {formatActionDescription(log)}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                              </span>
                            </div>

                            {/* Entity affected */}
                            {log.entity_type && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-xs font-normal mr-2">
                                  {log.entity_type.replace(/_/g, ' ')}
                                </Badge>
                                {log.entity_id && (
                                  <span className="text-xs font-mono">
                                    ID: {log.entity_id.slice(0, 8)}...
                                  </span>
                                )}
                              </p>
                            )}

                            {/* Additional details */}
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {activityHasMore && (
                      <div className="flex justify-center pt-4 mt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => fetchActivity(false)}
                          disabled={activityLoading}
                        >
                          {activityLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Load More
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* End of list indicator */}
                    {!activityHasMore && activityLogs.length > 0 && (
                      <p className="text-center text-xs text-muted-foreground pt-4 mt-4 border-t">
                        Showing all {activityTotal} {activityTotal === 1 ? 'activity' : 'activities'}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
            {/* Account Status Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Active Status</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isDeleted
                        ? 'Account is currently deactivated. User cannot access the platform.'
                        : 'Account is active. User can access the platform normally.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={user.isDeleted ? 'destructive' : 'default'}
                      className={user.isDeleted ? '' : 'bg-green-500 hover:bg-green-500/80'}
                    >
                      {user.isDeleted ? 'Inactive' : 'Active'}
                    </Badge>
                    <Switch
                      checked={!user.isDeleted}
                      onCheckedChange={handleStatusToggle}
                      disabled={isTogglingStatus}
                    />
                    {isTogglingStatus && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Lock Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {user.isDeleted ? (
                    <Lock className="h-5 w-5 text-destructive" />
                  ) : (
                    <Unlock className="h-5 w-5 text-green-500" />
                  )}
                  Account Lock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Lock Status</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isDeleted
                        ? 'Account is locked. User is temporarily blocked from accessing the platform.'
                        : 'Account is unlocked. User has normal access to the platform.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={user.isDeleted ? 'destructive' : 'outline'}
                    >
                      {user.isDeleted ? 'Locked' : 'Unlocked'}
                    </Badge>
                    <Switch
                      checked={user.isDeleted}
                      onCheckedChange={handleLockToggle}
                      disabled={isTogglingLock}
                    />
                    {isTogglingLock && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Password Status</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      {user.passwordSet ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span>Password is set.</span>
                          {lastPasswordChange && (
                            <span className="text-xs">
                              Last changed {formatDistanceToNow(new Date(lastPasswordChange), { addSuffix: true })}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4 text-yellow-500" />
                          <span>No password set (uses magic link login)</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResetPasswordDialogOpen(true)}
                    disabled={user.isDeleted || isPerformingAction}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MonitorSmartphone className="h-5 w-5" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!securityInitialized && !securityLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Button
                      variant="outline"
                      onClick={fetchSecurityData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load Security Data
                    </Button>
                  </div>
                ) : securityLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        {sessionCount > 0 ? (
                          <>
                            <Badge variant="secondary" className="mr-2">
                              {sessionCount}
                            </Badge>
                            recent login{sessionCount !== 1 ? 's' : ''} in the last 30 days
                          </>
                        ) : (
                          'No recent session activity recorded'
                        )}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRevokeSessionsDialogOpen(true)}
                      disabled={sessionCount === 0 || user.isDeleted}
                    >
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Revoke All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Failed Logins Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Failed Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!securityInitialized && !securityLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Load security data to view failed login attempts
                  </div>
                ) : securityLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium">Failed Attempts (Last 24 Hours)</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={failedLoginCount > 5 ? 'destructive' : failedLoginCount > 0 ? 'secondary' : 'outline'}
                        className={failedLoginCount === 0 ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                      >
                        {failedLoginCount}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {failedLoginCount === 0
                          ? 'No failed login attempts'
                          : failedLoginCount > 5
                          ? 'High number of failed attempts - consider locking account'
                          : `failed attempt${failedLoginCount !== 1 ? 's' : ''} recorded`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deactivate User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{user?.displayName}</strong>?
              They will no longer be able to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isPerformingAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPerformingAction ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Reactivate User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate <strong>{user?.displayName}</strong>?
              They will regain access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={isPerformingAction}
              className="bg-green-600 text-white hover:bg-green-600/90"
            >
              {isPerformingAction ? 'Reactivating...' : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock/Unlock Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {user?.isDeleted ? (
                <>
                  <Unlock className="h-5 w-5 text-yellow-600" />
                  Unlock User
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-yellow-600" />
                  Lock User
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user?.isDeleted ? (
                <>
                  Are you sure you want to unlock <strong>{user?.displayName}</strong>?
                  They will be able to access the platform again.
                </>
              ) : (
                <>
                  Are you sure you want to lock <strong>{user?.displayName}</strong>?
                  They will be temporarily unable to access the platform.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleLock}
              disabled={isPerformingAction}
              className="bg-yellow-600 text-white hover:bg-yellow-600/90"
            >
              {isPerformingAction ? 'Processing...' : user?.isDeleted ? 'Unlock' : 'Lock'}
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
              This will send a password reset email to <strong>{user?.email}</strong>.
              The user will need to click the link in the email to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={isPerformingAction}
            >
              {isPerformingAction ? 'Sending...' : 'Send Reset Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update profile information for {user?.displayName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="display_name"
                  placeholder="John Smith"
                  className="pl-10"
                  {...register('display_name')}
                />
              </div>
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="Managing Director"
                  className="pl-10"
                  {...register('title')}
                />
              </div>
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="office_location">Office Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="office_location"
                  placeholder="New York, NY"
                  className="pl-10"
                  {...register('office_location')}
                />
              </div>
              {errors.office_location && (
                <p className="text-sm text-destructive">{errors.office_location.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Entity Confirmation Dialog */}
      <AlertDialog open={removeEntityDialogOpen} onOpenChange={setRemoveEntityDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Entity Link
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <strong>{entityToRemove?.name}</strong> from {user?.displayName}?
              The user will no longer have access to this entity&apos;s data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingEntity}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveEntity}
              disabled={isRemovingEntity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingEntity ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Sessions Dialog */}
      <AlertDialog open={revokeSessionsDialogOpen} onOpenChange={setRevokeSessionsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" />
              Revoke All Sessions
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke all active sessions for <strong>{user?.displayName}</strong>?
              This will immediately log them out from all devices and browsers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingSessions}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeSessions}
              disabled={isRevokingSessions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevokingSessions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke All Sessions'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
