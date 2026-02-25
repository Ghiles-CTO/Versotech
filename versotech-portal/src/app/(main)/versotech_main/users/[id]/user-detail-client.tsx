'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
  ClockIcon,
  Upload,
  UserCheck,
  UserX,
  Users,
  Fingerprint,
} from 'lucide-react'
import type { UserRow, EntityAssociation } from '@/app/api/admin/users/route'
import { IndividualKycDisplay, type IndividualKycData } from '@/components/shared/individual-kyc-display'
import { ROLE_BADGE_CONFIG, ENTITY_TYPE_CONFIG } from '../types'

const KYC_STATUS_DISPLAY: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', icon: CheckCircle },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30', icon: Upload },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30', icon: ClockIcon },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30', icon: XCircle },
  expired: { label: 'Expired', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30', icon: AlertTriangle },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const ENTITY_ROUTES: Record<EntityAssociation['type'], string> = {
  investor: '/versotech_main/investors',
  partner: '/versotech_main/partners',
  lawyer: '/versotech_main/lawyers',
  commercial_partner: '/versotech_main/commercial-partners',
  introducer: '/versotech_main/introducers',
  arranger: '/versotech_main/arrangers'
}

const APPROVAL_BADGE_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  pending_onboarding: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  pending_approval: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
}

const APPROVAL_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending_onboarding: 'Pending Onboarding',
  pending_approval: 'Pending Approval',
  rejected: 'Rejected',
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}

function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

interface UserDetailClientProps {
  user: UserRow
  fullKycData: IndividualKycData | null
}

const STAFF_ROLES = new Set(['ceo', 'staff_admin', 'staff_ops', 'staff_rm'])

export function UserDetailClient({ user, fullKycData }: UserDetailClientProps) {
  const router = useRouter()
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const entityPersonas = Array.from(new Set(user.entities.map(e => e.type)))
  const isStaffRole = STAFF_ROLES.has(user.systemRole)
  const staffRoleConfig = isStaffRole ? ROLE_BADGE_CONFIG[user.systemRole] : null

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
        router.refresh()
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
      {/* Back Navigation */}
      <Link href="/versotech_main/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Identity */}
            <div className="flex items-start gap-5">
              <Avatar className="h-16 w-16 ring-2 ring-border ring-offset-2 ring-offset-background">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                    {user.displayName}
                    {user.isSuperAdmin && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                    {user.isDeleted && (
                      <Badge variant="destructive" className="text-xs">Deactivated</Badge>
                    )}
                  </h1>
                  {user.title && <p className="text-base text-muted-foreground mt-1">{user.title}</p>}
                </div>
                {/* Persona Badges + KYC Status */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {staffRoleConfig && (
                    <Badge variant="outline" className={`text-xs ${staffRoleConfig.className}`}>
                      {staffRoleConfig.label}
                    </Badge>
                  )}
                  {entityPersonas.map(type => {
                    const config = ENTITY_TYPE_CONFIG[type]
                    return (
                      <Badge key={type} variant="outline" className={`text-xs ${config?.className || ''}`}>
                        {config?.label || type}
                      </Badge>
                    )
                  })}
                  {!staffRoleConfig && entityPersonas.length === 0 && (
                    <Badge variant="outline" className={`text-xs ${
                      (ROLE_BADGE_CONFIG[user.systemRole] || { className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400' }).className
                    }`}>
                      {(ROLE_BADGE_CONFIG[user.systemRole] || { label: user.systemRole }).label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${user.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
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
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-green-500/40 dark:text-green-400 dark:hover:bg-green-500/10"
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

          <Separator className="my-6" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
            <InfoItem icon={Clock} label="Last Active" value={getRelativeTime(user.lastLoginAt)} />
            <InfoItem
              icon={Phone}
              label="Phone"
              value={user.phone || fullKycData?.phone_mobile || fullKycData?.phone_office || 'Not set'}
            />
          </div>

          {/* Account Status + Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <StatCard icon={Fingerprint} value={entityPersonas.length} label={entityPersonas.length === 1 ? 'Account Type' : 'Account Types'} />
            <StatCard icon={Building2} value={user.entityCount} label={user.entityCount === 1 ? 'Entity' : 'Entities'} />
            <div className="flex flex-col justify-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <StatusIndicator active={user.passwordSet} label={user.passwordSet ? 'Password set' : 'No password'} />
              <StatusIndicator active={user.hasSignature} label={user.hasSignature ? 'Signature uploaded' : 'No signature'} />
            </div>
            <div className="flex flex-col justify-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <StatusIndicator active={!user.isDeleted} label={user.isDeleted ? 'Account deactivated' : 'Account active'} />
              <StatusIndicator active={user.isSuperAdmin} label={user.isSuperAdmin ? 'Super admin' : 'Standard user'} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Associations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Entity Associations
          </CardTitle>
          <CardDescription>
            Organizations this user is associated with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.entities.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No entity associations</p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.entities.map((entity) => {
                const config = ENTITY_TYPE_CONFIG[entity.type]
                const entityRoute = ENTITY_ROUTES[entity.type]
                const approvalStyle = entity.approvalStatus
                  ? (APPROVAL_BADGE_STYLES[entity.approvalStatus] || APPROVAL_BADGE_STYLES.pending_onboarding)
                  : ''

                return (
                  <div
                    key={`${entity.type}-${entity.id}`}
                    className="group flex items-center justify-between rounded-lg border border-border/60 bg-card p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{entity.name}</span>
                        <Badge variant="outline" className={`text-xs shrink-0 ${config?.className || ''}`}>
                          {config?.label || entity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground capitalize">{entity.role}</span>
                        {entity.memberRole && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30">
                            Role: {entity.memberRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                        {entity.isPrimary && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">
                            Primary
                          </Badge>
                        )}
                        {entity.canSign && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                            <PenTool className="h-2.5 w-2.5 mr-0.5" />
                            Signatory
                          </Badge>
                        )}
                        {entity.approvalStatus && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${approvalStyle}`}>
                            {APPROVAL_LABELS[entity.approvalStatus] || entity.approvalStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                        {entity.memberKycStatus && (() => {
                          const kycDisplay = KYC_STATUS_DISPLAY[entity.memberKycStatus]
                          if (!kycDisplay) return null
                          const KycIcon = kycDisplay.icon
                          return (
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${kycDisplay.className}`}>
                              <KycIcon className="h-2.5 w-2.5 mr-0.5" />
                              KYC: {kycDisplay.label}
                            </Badge>
                          )
                        })()}
                      </div>
                    </div>
                    {entityRoute && (
                      <Link href={`${entityRoute}/${entity.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* KYC Information */}
      {fullKycData ? (
        <IndividualKycDisplay
          data={fullKycData}
          title="KYC Personal Information"
          showEditButton={false}
          showIdentification
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              KYC Personal Information
            </CardTitle>
            <CardDescription>
              Know Your Customer verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No KYC data available for this user</p>
            </div>
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
              className="bg-emerald-600 text-white hover:bg-emerald-700"
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
