'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
} from 'lucide-react'

// Types
import type { UserRow } from '@/app/api/admin/users/route'
import type { SingleUserResponse } from '@/app/api/admin/users/[id]/route'

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
                <Button variant="outline" size="sm">
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

      {/* Placeholder for tabs (US-014 onwards) */}
      {user && !loading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center py-8">
              User profile tabs will be implemented in the next stories (US-014 onwards).
            </p>
          </CardContent>
        </Card>
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
    </div>
  )
}
