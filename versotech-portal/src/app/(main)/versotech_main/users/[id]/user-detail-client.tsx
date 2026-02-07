'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Key,
  Shield,
  PenTool,
  Building2,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react'
import type { UserRow, EntityAssociation } from '@/app/api/admin/users/route'
import { IndividualKycDisplay, type IndividualKycData } from '@/components/shared/individual-kyc-display'
import { ROLE_BADGE_CONFIG, ENTITY_TYPE_CONFIG, KYC_STATUS_CONFIG } from '../types'

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
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

// Format date for display
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Entity route mappings
const ENTITY_ROUTES: Record<EntityAssociation['type'], string> = {
  investor: '/versotech_main/investors',
  partner: '/versotech_main/partners',
  lawyer: '/versotech_main/lawyers',
  commercial_partner: '/versotech_main/commercial-partners',
  introducer: '/versotech_main/introducers',
  arranger: '/versotech_main/arrangers'
}

// Map KYC_STATUS_CONFIG icon strings to Lucide components
const KYC_ICON_MAP: Record<string, typeof CheckCircle> = {
  check: CheckCircle,
  clock: Clock,
  upload: Clock, // Using Clock as upload placeholder
  x: XCircle,
  alert: AlertTriangle
}

// KYC Status Badge styles matching the status
const KYC_BADGE_STYLES: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
}

// KYC Status Badge Component
function KycStatusBadge({ status }: { status: string }) {
  const config = KYC_STATUS_CONFIG[status]
  if (!config) return null

  const KycIcon = KYC_ICON_MAP[config.icon] || CheckCircle
  const badgeStyle = KYC_BADGE_STYLES[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <Badge variant="outline" className={badgeStyle}>
      <KycIcon className="h-3 w-3 mr-1" />
      KYC {config.label}
    </Badge>
  )
}

interface UserDetailClientProps {
  user: UserRow
  fullKycData: IndividualKycData | null
}

export function UserDetailClient({ user, fullKycData }: UserDetailClientProps) {
  const router = useRouter()
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const roleConfig = ROLE_BADGE_CONFIG[user.systemRole] || { label: user.systemRole, className: 'bg-gray-500/20 text-gray-400' }

  const handleResetPassword = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('Password reset email sent successfully')
        setIsResetPasswordDialogOpen(false)
      } else {
        toast.error(data?.error || 'Failed to send password reset email')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An error occurred while sending password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/deactivate`, {
        method: 'PATCH'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('User deactivated successfully')
        setIsDeactivateDialogOpen(false)
        router.push('/versotech_main/users')
      } else {
        toast.error(data?.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Deactivate error:', error)
      toast.error('An error occurred while deactivating user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reactivate`, {
        method: 'PATCH'
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        toast.success('User reactivated successfully')
        setIsReactivateDialogOpen(false)
        router.refresh() // Refresh to get updated user data
      } else {
        toast.error(data?.error || 'Failed to reactivate user')
      }
    } catch (error) {
      console.error('Reactivate error:', error)
      toast.error('An error occurred while reactivating user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/users">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                <AvatarFallback className="text-xl">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {user.displayName}
                  {user.isSuperAdmin && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {user.title || 'No title'}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={roleConfig.className}>
                    {roleConfig.label}
                  </Badge>
                  {user.kyc?.status && KYC_STATUS_CONFIG[user.kyc.status] && (
                    <KycStatusBadge status={user.kyc.status} />
                  )}
                  {user.isDeleted && (
                    <Badge variant="destructive">Deactivated</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${user.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetPasswordDialogOpen(true)}
                disabled={user.isDeleted}
              >
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              {user.isDeleted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReactivateDialogOpen(true)}
                  className="border-green-500 text-green-500 hover:bg-green-500/10"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeactivateDialogOpen(true)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user.officeLocation && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{user.officeLocation}</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined: {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Last Active: {getRelativeTime(user.lastLoginAt)}</span>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className={`h-4 w-4 ${user.passwordSet ? 'text-green-400' : 'text-muted-foreground/30'}`} />
                <span className="text-sm text-muted-foreground">
                  Password: {user.passwordSet ? 'Set' : 'Not Set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PenTool className={`h-4 w-4 ${user.hasSignature ? 'text-green-400' : 'text-muted-foreground/30'}`} />
                <span className="text-sm text-muted-foreground">
                  Signature: {user.hasSignature ? 'Uploaded' : 'None'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user.entityCount} {user.entityCount === 1 ? 'Entity' : 'Entities'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Associations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Entity Associations
          </CardTitle>
          <CardDescription>
            Organizations this user is associated with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.entities.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No entity associations
            </p>
          ) : (
            <div className="space-y-3">
              {user.entities.map((entity) => {
                const config = ENTITY_TYPE_CONFIG[entity.type]
                const entityRoute = ENTITY_ROUTES[entity.type]
                return (
                  <div
                    key={`${entity.type}-${entity.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
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
                          {entity.approvalStatus && (
                            <Badge
                              variant="outline"
                              className={`text-xs py-0 ${
                                entity.approvalStatus === 'approved'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : entity.approvalStatus === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {entity.approvalStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {entityRoute && (
                      <Link href={`${entityRoute}/${entity.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KYC Personal Information Form */}
      {fullKycData ? (
        <IndividualKycDisplay
          data={fullKycData}
          title="KYC Personal Information"
          showEditButton={false}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC Personal Information
            </CardTitle>
            <CardDescription>
              Know Your Customer verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm py-4 text-center">
              No KYC data available for this user
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Dialog */}
      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to <strong>{user.email}</strong>.
              The user will need to click the link in the email to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? (
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
              Are you sure you want to deactivate <strong>{user.displayName}</strong>?
              This user will no longer be able to access the platform.
              This action can be reversed by reactivating the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
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
              Are you sure you want to reactivate <strong>{user.displayName}</strong>?
              This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={isLoading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isLoading ? (
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
