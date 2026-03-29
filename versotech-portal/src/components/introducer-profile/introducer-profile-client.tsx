'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCountryName } from '@/components/kyc/country-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Mail,
  Phone,
  User,
  Shield,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Lock,
  Globe,
  AlertCircle,
  Users,
  Send,
  Info,
  ArrowRight,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatViewerDateTime } from '@/lib/format'
import { toast } from 'sonner'

// Import profile components
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { IntroducerKYCDocumentsTab } from '@/components/profile/introducer-kyc-documents-tab'
import { GenericEntityMembersTab } from '@/components/profile/generic-entity-members-tab'
import { ProfileOverviewShell, OverviewSectionCard } from '@/components/profile/overview'

// Import shared KYC dialog components
import { EntityKYCEditDialog, EntityOverviewEditDialog, IndividualKycDisplay } from '@/components/shared'
import { PersonalKYCSection, MemberKYCData } from '@/components/profile/personal-kyc-section'
import { type ApprovedKycDocumentMetadata } from '@/lib/kyc/approved-document-metadata'

type IntroducerInfo = {
  id: string
  legal_name: string | null
  contact_name: string | null
  email: string | null
  default_commission_bps: number | null
  payment_terms: string | null
  commission_cap_amount: number | null
  status: string | null
  notes: string | null
  created_at: string | null
  logo_url: string | null
  kyc_status: string | null
  account_approval_status: string | null
  account_rejection_reason: string | null
  onboarding_status: string | null
  display_name: string | null
  // Entity type
  type: 'individual' | 'entity' | 'sole_proprietor' | null
  // Address fields
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  // Phone/contact
  phone: string | null
  phone_mobile: string | null
  phone_office: string | null
  website: string | null
  // Individual KYC fields
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  name_suffix: string | null
  date_of_birth: string | null
  country_of_birth: string | null
  nationality: string | null
  // US Tax compliance
  is_us_citizen: boolean | null
  is_us_taxpayer: boolean | null
  us_taxpayer_id: string | null
  country_of_tax_residency: string | null
  // ID Document
  id_type: string | null
  id_number: string | null
  id_issue_date: string | null
  id_expiry_date: string | null
  id_issuing_country: string | null
  // Residential Address
  residential_street: string | null
  residential_line_2: string | null
  residential_city: string | null
  residential_state: string | null
  residential_postal_code: string | null
  residential_country: string | null
  // Entity fields
  country_of_incorporation: string | null
  registration_number: string | null
  tax_id: string | null
  // Additional KYC fields
  middle_initial: string | null
  proof_of_address_date: string | null
  proof_of_address_expiry: string | null
  tax_id_number: string | null
}

type IntroducerUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
}

type Profile = {
  id?: string | null
  display_name?: string | null
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface IntroducerProfileClientProps {
  defaultTab?: string
  defaultAction?: string | null
  defaultMemberId?: string | null
  userEmail: string
  profile: Profile | null
  introducerInfo: IntroducerInfo | null
  introducerUserInfo: IntroducerUserInfo
  memberInfo: MemberKYCData | null
  approvedDocMetadata?: ApprovedKycDocumentMetadata | null
  introducerAccountApprovalReadiness?: {
    introducerId: string
    introducerName: string
    introducerType: string
    accountApprovalStatus: string | null
    isKycApproved: boolean
    isReady: boolean
    hasPendingApproval: boolean
    pendingApprovalId: string | null
    missingItems: Array<{
      scope: 'entity' | 'member'
      name: string
      email?: string | null
      missingItems: string[]
      memberId?: string | null
    }>
    latestRequestInfo: {
      details: string
      reason: string | null
      requestedAt: string | null
    } | null
  } | null
}

type SaveFollowUpResult = {
  level?: 'success' | 'info' | 'error'
  message?: string
  closeDialog?: boolean
  refresh?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
}

const KYC_BADGES: Record<string, { label: string; className: string }> = {
  approved: { label: 'KYC Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  pending: { label: 'KYC Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  pending_review: { label: 'KYC Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  submitted: { label: 'KYC Submitted', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  under_review: { label: 'KYC Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  rejected: { label: 'KYC Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
}

const ACCOUNT_APPROVAL_BADGES: Record<string, { label: string; className: string }> = {
  approved: { label: 'Account Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  pending_onboarding: { label: 'Onboarding Required', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  pending_approval: { label: 'Awaiting Approval', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  incomplete: { label: 'Account Incomplete', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  unauthorized: { label: 'Account Restricted', className: 'bg-red-100 text-red-800 border-red-200' },
  rejected: { label: 'Account Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
}
const ONBOARDING_BADGES: Record<string, { label: string; className: string }> = {
  completed: { label: 'Onboarding Complete', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  pending: { label: 'Onboarding Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'Onboarding In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
}

export function IntroducerProfileClient({
  defaultTab = 'overview',
  defaultAction,
  defaultMemberId,
  userEmail,
  profile,
  introducerInfo,
  introducerUserInfo,
  memberInfo,
  approvedDocMetadata,
  introducerAccountApprovalReadiness,
}: IntroducerProfileClientProps) {
  const [isSubmittingAccountApproval, setIsSubmittingAccountApproval] = useState(false)
  const [showRequestInfoDetails, setShowRequestInfoDetails] = useState(false)
  const [profileData, setProfileData] = useState(profile)

  // KYC Edit Dialog state
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showEntityOverviewDialog, setShowEntityOverviewDialog] = useState(false)
  const canEditEntityProfile = introducerUserInfo.role === 'admin' || introducerUserInfo.is_primary
  const canSubmitAccountApproval = canEditEntityProfile
  const readiness = introducerAccountApprovalReadiness || null
  const missingAccountKycItems = readiness?.missingItems || []
  const hasPendingAccountApproval = readiness?.hasPendingApproval || false
  const latestAccountRequestInfo = readiness?.latestRequestInfo || null
  const isAccountApprovalReady = readiness?.isReady || false

  useEffect(() => {
    setProfileData(profile)
  }, [profile])

  const submitEntityKycAfterSave = async (): Promise<SaveFollowUpResult> => {
    if (!introducerInfo?.id) {
      return {
        level: 'error',
        message: 'Changes saved, but entity KYC could not be updated.',
      }
    }

    try {
      const response = await fetch('/api/me/entity-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'introducer',
          entityId: introducerInfo.id,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        return { level: 'success', message: 'Entity KYC saved' }
      }

      if (Array.isArray(data?.missing) && data.missing.length > 0) {
        return {
          level: 'info',
          message: `Changes saved. Complete ${data.missing.join(', ')}.`,
          closeDialog: false,
          refresh: false,
        }
      }

      if (Array.isArray(data?.invalid) && data.invalid.length > 0) {
        return {
          level: 'info',
          message: `Changes saved. Fix ${data.invalid.join(', ')}.`,
          closeDialog: false,
          refresh: false,
        }
      }

      if (
        typeof data?.error === 'string' &&
        (
          data.error.includes('already submitted') ||
          data.error.includes('already approved') ||
          data.error.includes('Entity KYC information already submitted')
        )
      ) {
        return {
          level: 'info',
          message: 'Changes saved.',
        }
      }

      return {
        level: 'error',
        message: data?.error || 'Changes saved, but entity KYC could not be updated.',
      }
    } catch (error) {
      console.error('[introducer-profile] Failed to submit entity KYC after save:', error)
      return {
        level: 'error',
        message: 'Changes saved, but entity KYC could not be updated.',
      }
    }
  }

  const handleSubmitAccountForApproval = async () => {
    setIsSubmittingAccountApproval(true)
    try {
      const response = await fetch('/api/introducers/me/submit-account-approval', {
        method: 'POST',
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (Array.isArray(data?.missing) && data.missing.length > 0) {
          const firstMissing = data.missing[0]
          const firstLine =
            firstMissing && typeof firstMissing === 'object'
              ? `${String((firstMissing as { name?: string }).name || 'KYC')}: ${
                  Array.isArray((firstMissing as { missingItems?: unknown[] }).missingItems)
                    ? (firstMissing as { missingItems: string[] }).missingItems.join(', ')
                    : 'missing information'
                }`
              : 'Missing KYC information'
          throw new Error(firstLine)
        }

        throw new Error(data?.error || 'Failed to submit account for approval')
      }

      toast.success('Account submitted for approval')
      window.location.reload()
    } catch (error) {
      console.error('[introducer-profile] Failed to submit account approval:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit account for approval')
    } finally {
      setIsSubmittingAccountApproval(false)
    }
  }

  const normalizedDefaultTab = useMemo(() => {
    if (defaultTab === 'profile') return 'overview'
    if (defaultTab === 'agreement') return 'overview'
    if (defaultTab === 'members') return 'team'
    if (defaultTab === 'preferences') return 'overview'
    if (defaultTab === 'notices') return 'overview'
    return defaultTab
  }, [defaultTab])

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            avatar_url: newAvatarUrl,
          }
        : prev
    )
  }

  useEffect(() => {
    if (!defaultAction) return

    if (defaultAction === 'edit-individual-kyc') {
      setShowKycDialog(true)
    } else if (defaultAction === 'edit-entity-overview') {
      setShowEntityOverviewDialog(true)
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('action')
      url.searchParams.delete('memberId')
      window.history.replaceState({}, '', url.toString())
    }
  }, [defaultAction])

  const accountApprovalStatusKey = (introducerInfo?.account_approval_status || 'pending_onboarding').toLowerCase()
  const onboardingStatusKey = (introducerInfo?.onboarding_status || 'pending').toLowerCase()
  const accountApprovalBadge = ACCOUNT_APPROVAL_BADGES[accountApprovalStatusKey] || {
    label: 'Account Pending',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const onboardingBadge = ONBOARDING_BADGES[onboardingStatusKey] || {
    label: 'Onboarding Pending',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const kycBadge = KYC_BADGES[introducerInfo?.kyc_status || 'pending'] || KYC_BADGES.pending
  const showRequestInfoBadge =
    !!latestAccountRequestInfo && !hasPendingAccountApproval && accountApprovalStatusKey !== 'approved'
  const hideAccountApprovalSection = accountApprovalStatusKey === 'approved'
  const accountApprovalSubmitDisabled =
    isSubmittingAccountApproval ||
    !canSubmitAccountApproval ||
    hasPendingAccountApproval ||
    !isAccountApprovalReady

  const profileDisplayName =
    profileData?.display_name ||
    profileData?.full_name ||
    userEmail ||
    'Introducer User'
  const isIndividualIntroducer = introducerInfo?.type === 'individual'
  const showRejectedAccountState = accountApprovalStatusKey === 'rejected'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ProfileImageUpload
            currentAvatarUrl={profileData?.avatar_url}
            userName={profileDisplayName}
            onAvatarUpdate={handleAvatarUpdate}
            compact
          />

          <div>
            <h1 className="text-2xl font-bold">
              {introducerInfo?.display_name || introducerInfo?.legal_name || 'Introducer Profile'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your introducer profile, documents, and team
            </p>
          </div>
        </div>

        {introducerInfo && (
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Badge
              variant="outline"
              className={cn('text-xs capitalize', STATUS_STYLES[introducerInfo?.status || 'inactive'])}
            >
              {introducerInfo?.status || 'Unknown'}
            </Badge>
            <Badge className={accountApprovalBadge.className}>{accountApprovalBadge.label}</Badge>
            <Badge className={onboardingBadge.className}>{onboardingBadge.label}</Badge>
            <Badge className={kycBadge.className}>{kycBadge.label}</Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={normalizedDefaultTab} className="space-y-6" id="introducer-profile-tabs">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          {introducerInfo?.type === 'entity' && (
            <TabsTrigger value="entity-members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Directors/UBOs
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProfileOverviewShell>
            {!hideAccountApprovalSection && (
            <Card className="overflow-hidden">
              <div className={`px-6 py-2.5 flex items-center gap-2 ${
                hasPendingAccountApproval
                  ? 'bg-blue-50 border-b border-blue-100'
                  : showRejectedAccountState || showRequestInfoBadge
                      ? 'bg-red-50 border-b border-red-100'
                      : isAccountApprovalReady
                        ? 'bg-emerald-50 border-b border-emerald-100'
                        : 'bg-amber-50 border-b border-amber-100'
              }`}>
                {hasPendingAccountApproval ? (
                  <>
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Under Review</span>
                  </>
                ) : showRejectedAccountState || showRequestInfoBadge ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Action Required</span>
                  </>
                ) : isAccountApprovalReady ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Ready to Submit</span>
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Onboarding In Progress</span>
                  </>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-base">Submit Account for Approval</CardTitle>
                <CardDescription>
                  Submit your completed account file to the CEO for activation review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={accountApprovalBadge.className}>{accountApprovalBadge.label}</Badge>
                  <Badge className={onboardingBadge.className}>{onboardingBadge.label}</Badge>
                  <Badge className={kycBadge.className}>{kycBadge.label}</Badge>
                </div>

                {showRejectedAccountState ? (
                  <div className="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
                    {introducerInfo?.account_rejection_reason || 'This introducer account needs changes before it can be approved.'}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {introducerInfo?.type === 'entity'
                        ? 'Complete your entity profile, entity KYC documents, and the KYC for all required members before submitting the account for approval.'
                        : 'Complete your personal information, proof of identification, and proof of address before submitting the account for approval.'}
                    </p>

                    {showRequestInfoBadge && latestAccountRequestInfo && (
                      <div className="rounded-lg border border-red-200 bg-red-50/80 p-4">
                        <button
                          type="button"
                          onClick={() => setShowRequestInfoDetails((prev) => !prev)}
                          className="flex w-full items-start gap-3 text-left"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900">Latest request for information</p>
                            <p className="mt-0.5 text-xs text-red-700">
                              The review team has requested additional information. Tap to {showRequestInfoDetails ? 'hide' : 'view'} details.
                            </p>
                          </div>
                          <ArrowRight className={`h-4 w-4 text-red-400 shrink-0 mt-0.5 transition-transform ${showRequestInfoDetails ? 'rotate-90' : ''}`} />
                        </button>
                        {showRequestInfoDetails && (
                          <div className="mt-3 ml-9 rounded-md bg-white/60 border border-red-100 p-3">
                            <p className="text-sm text-red-800">{latestAccountRequestInfo.details}</p>
                            {latestAccountRequestInfo.requestedAt && (
                              <p className="mt-2 text-xs text-red-600">
                                Requested on {formatViewerDateTime(latestAccountRequestInfo.requestedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {missingAccountKycItems.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Outstanding KYC requirements
                        </p>
                        <div className="divide-y divide-border rounded-lg border bg-muted/30">
                          {missingAccountKycItems.map((item, index) => (
                            <div
                              key={`${item.scope}-${item.memberId || item.name}-${index}`}
                              className="flex items-start gap-3 px-3 py-2.5"
                            >
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                <XCircle className="h-3 w-3 text-amber-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
                                {item.scope === 'member' && item.email && (
                                  <p className="text-xs text-muted-foreground">{item.email}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Outstanding: {item.missingItems.join(' · ')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          All required KYC items are complete.
                        </p>
                      </div>
                    )}

                    <div className="pt-1">
                      {hasPendingAccountApproval ? (
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            Under review by the CEO.
                          </p>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={handleSubmitAccountForApproval}
                            disabled={accountApprovalSubmitDisabled}
                            className={isAccountApprovalReady && canSubmitAccountApproval ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                            size="sm"
                          >
                            {isSubmittingAccountApproval ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Account for Approval
                              </>
                            )}
                          </Button>

                          {!canSubmitAccountApproval && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Only primary contacts or admins can submit account approval.
                            </p>
                          )}
                          {canSubmitAccountApproval && !hasPendingAccountApproval && !isAccountApprovalReady && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Complete all required KYC items before submitting for approval.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            )}

            <div className="rounded-lg border bg-card px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profileDisplayName}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {profileData?.email || userEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {introducerUserInfo.role}
                </Badge>
                {introducerUserInfo.is_primary && (
                  <Badge variant="secondary" className="text-xs">Primary Contact</Badge>
                )}
                {introducerUserInfo.can_sign && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    Signatory
                  </Badge>
                )}
              </div>
            </div>

            {!isIndividualIntroducer && (
              <OverviewSectionCard
                title="Entity Overview"
                description="Legal details, contact information, and registered address"
                icon={Building2}
                contentClassName="space-y-4"
                action={
                  canEditEntityProfile ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowEntityOverviewDialog(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  ) : undefined
                }
              >
              <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Entity Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Type</p>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize font-medium">
                        {(introducerInfo?.type || 'entity').replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Display Name</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.display_name || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Legal Name</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.legal_name || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Country of Incorporation</p>
                    <p className="mt-1 text-sm font-medium">{getCountryName(introducerInfo?.country_of_incorporation) || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Registration Number</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.registration_number || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tax ID</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.tax_id_number || introducerInfo?.tax_id || '-'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Contact Person</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.contact_name || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {introducerInfo?.email || '-'}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {introducerInfo?.phone || '-'}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Mobile</p>
                    <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {introducerInfo?.phone_mobile || '-'}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Office Phone</p>
                    <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {introducerInfo?.phone_office || '-'}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Website</p>
                    <div className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {introducerInfo?.website ? (
                        <a
                          href={introducerInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {introducerInfo.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Registered Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Address</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.address_line_1 || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Address (Optional)</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.address_line_2 || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">City</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.city || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">State / Province</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.state_province || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Postal Code</p>
                    <p className="mt-1 text-sm font-medium">{introducerInfo?.postal_code || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Country</p>
                    <p className="mt-1 text-sm font-medium">{getCountryName(introducerInfo?.country) || '-'}</p>
                  </div>
                </div>
              </section>
              </OverviewSectionCard>
            )}

            {!isIndividualIntroducer && introducerInfo && (
              <PersonalKYCSection
                memberData={memberInfo}
                entityType="introducer"
                entityId={introducerInfo.id}
                onRefresh={() => window.location.reload()}
                profileEmail={profileData?.email || userEmail}
                profileName={profileData?.full_name || profileData?.display_name || null}
                autoOpenEdit={defaultAction === 'edit-personal-kyc'}
              />
            )}

            {isIndividualIntroducer && (
              <IndividualKycDisplay
                data={{
                  first_name: introducerInfo?.first_name,
                  middle_name: introducerInfo?.middle_name,
                  middle_initial: introducerInfo?.middle_initial,
                  last_name: introducerInfo?.last_name,
                  name_suffix: introducerInfo?.name_suffix,
                  date_of_birth: introducerInfo?.date_of_birth,
                  country_of_birth: introducerInfo?.country_of_birth,
                  nationality: introducerInfo?.nationality,
                  email: introducerInfo?.email,
                  phone_mobile: introducerInfo?.phone_mobile,
                  phone_office: introducerInfo?.phone_office,
                  residential_street: introducerInfo?.residential_street,
                  residential_line_2: introducerInfo?.residential_line_2,
                  residential_city: introducerInfo?.residential_city,
                  residential_state: introducerInfo?.residential_state,
                  residential_postal_code: introducerInfo?.residential_postal_code,
                  residential_country: introducerInfo?.residential_country,
                  is_us_citizen: introducerInfo?.is_us_citizen,
                  is_us_taxpayer: introducerInfo?.is_us_taxpayer,
                  us_taxpayer_id: introducerInfo?.us_taxpayer_id,
                  country_of_tax_residency: introducerInfo?.country_of_tax_residency,
                  tax_id_number: introducerInfo?.tax_id_number || introducerInfo?.tax_id,
                  id_type: approvedDocMetadata?.id_type || introducerInfo?.id_type,
                  id_number: approvedDocMetadata?.id_number || introducerInfo?.id_number,
                  id_issue_date: approvedDocMetadata?.id_issue_date || introducerInfo?.id_issue_date,
                  id_expiry_date: approvedDocMetadata?.id_expiry_date || introducerInfo?.id_expiry_date,
                  id_issuing_country: approvedDocMetadata?.id_issuing_country || introducerInfo?.id_issuing_country,
                  proof_of_address_date: approvedDocMetadata?.proof_of_address_date || introducerInfo?.proof_of_address_date,
                }}
                onEdit={() => setShowKycDialog(true)}
                showEditButton={canEditEntityProfile}
                title="Personal KYC Information"
                addressDisplay="combined"
              />
            )}
          </ProfileOverviewShell>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          {introducerInfo && (
            <MembersManagementTab
              entityType="introducer"
              entityId={introducerInfo.id}
              entityName={introducerInfo.legal_name || 'Introducer'}
              showSignatoryOption={true}
              canManageMembers={introducerUserInfo.role === 'admin' || introducerUserInfo.is_primary}
            />
          )}
        </TabsContent>

        {/* Entity Members Tab (Directors/UBOs) - Only for entity-type introducers */}
        {introducerInfo?.type === 'entity' && (
          <TabsContent value="entity-members" className="space-y-4">
            <GenericEntityMembersTab
              entityType="introducer"
              entityId={introducerInfo.id}
              entityName={introducerInfo.legal_name || introducerInfo.contact_name || 'Introducer'}
              apiEndpoint="/api/introducers/me/members"
              canManage={introducerUserInfo.role === 'admin' || introducerUserInfo.is_primary}
              title="Directors, UBOs & Signatories"
              description="Manage directors, beneficial owners (>25% ownership), and authorized signatories with full KYC information. Click on a member to edit their complete KYC profile."
              autoEditMemberId={defaultAction === 'edit-member' ? defaultMemberId : null}
            />
          </TabsContent>
        )}

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">KYC Documents</h2>
            <p className="text-muted-foreground">
              Upload required identity and verification documents.
            </p>
          </div>
          {introducerInfo && (
            <IntroducerKYCDocumentsTab
              introducerId={introducerInfo.id}
              introducerName={introducerInfo.legal_name || undefined}
              kycStatus={introducerInfo.kyc_status || undefined}
              entityType={introducerInfo.type}
              autoOpenUpload={defaultAction === 'upload-doc'}
            />
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>

      {/* KYC Edit Dialogs */}
      {introducerInfo?.type === 'individual' && (
        <EntityKYCEditDialog
          open={showKycDialog}
          onOpenChange={setShowKycDialog}
          entityType="introducer"
          entityId={introducerInfo?.id || ''}
          entityName={introducerInfo?.legal_name || introducerInfo?.contact_name || undefined}
          initialData={{
            first_name: introducerInfo?.first_name ?? undefined,
            middle_name: introducerInfo?.middle_name ?? undefined,
            middle_initial: introducerInfo?.middle_initial ?? undefined,
            last_name: introducerInfo?.last_name ?? undefined,
            name_suffix: introducerInfo?.name_suffix ?? undefined,
            date_of_birth: introducerInfo?.date_of_birth ?? undefined,
            nationality: introducerInfo?.nationality ?? undefined,
            country_of_birth: introducerInfo?.country_of_birth ?? undefined,
            email: introducerInfo?.email ?? profileData?.email ?? userEmail ?? undefined,
            phone_mobile: introducerInfo?.phone_mobile ?? undefined,
            phone_office: introducerInfo?.phone_office ?? undefined,
            is_us_citizen: introducerInfo?.is_us_citizen === true,
            is_us_taxpayer: introducerInfo?.is_us_taxpayer === true,
            us_taxpayer_id: introducerInfo?.us_taxpayer_id ?? undefined,
            country_of_tax_residency: introducerInfo?.country_of_tax_residency ?? undefined,
            tax_id_number: introducerInfo?.tax_id_number ?? introducerInfo?.tax_id ?? undefined,
            id_type: introducerInfo?.id_type ?? undefined,
            id_number: introducerInfo?.id_number ?? undefined,
            id_issue_date: introducerInfo?.id_issue_date ?? undefined,
            id_expiry_date: introducerInfo?.id_expiry_date ?? undefined,
            id_issuing_country: introducerInfo?.id_issuing_country ?? undefined,
            residential_street: introducerInfo?.residential_street ?? undefined,
            residential_city: introducerInfo?.residential_city ?? undefined,
            residential_state: introducerInfo?.residential_state ?? undefined,
            residential_postal_code: introducerInfo?.residential_postal_code ?? undefined,
            residential_country: introducerInfo?.residential_country ?? undefined,
            proof_of_address_date: introducerInfo?.proof_of_address_date ?? undefined,
          }}
          apiEndpoint="/api/introducers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}

      {introducerInfo && !isIndividualIntroducer && (
        <EntityOverviewEditDialog
          open={showEntityOverviewDialog}
          onOpenChange={setShowEntityOverviewDialog}
          entityName={introducerInfo.legal_name || introducerInfo.contact_name || undefined}
          initialData={{
            display_name: introducerInfo.display_name ?? undefined,
            legal_name: introducerInfo.legal_name ?? undefined,
            contact_name: introducerInfo.contact_name ?? undefined,
            country_of_incorporation: introducerInfo.country_of_incorporation ?? undefined,
            registration_number: introducerInfo.registration_number ?? undefined,
            tax_id_number: introducerInfo.tax_id_number ?? introducerInfo.tax_id ?? undefined,
            email: introducerInfo.email ?? undefined,
            phone: introducerInfo.phone ?? undefined,
            phone_mobile: introducerInfo.phone_mobile ?? undefined,
            phone_office: introducerInfo.phone_office ?? undefined,
            website: introducerInfo.website ?? undefined,
            address: introducerInfo.address_line_1 ?? undefined,
            address_2: introducerInfo.address_line_2 ?? undefined,
            city: introducerInfo.city ?? undefined,
            state_province: introducerInfo.state_province ?? undefined,
            postal_code: introducerInfo.postal_code ?? undefined,
            country: introducerInfo.country ?? undefined,
          }}
          apiEndpoint="/api/introducers/me/profile"
          afterSave={submitEntityKycAfterSave}
          showContactName
          showRegistrationFields
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
