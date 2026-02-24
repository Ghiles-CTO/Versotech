'use client'

import { useEffect, useState } from 'react'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { KYCDocumentsTab } from '@/components/profile/kyc-documents-tab'
import { CounterpartyEntitiesTab } from '@/components/profile/counterparty-entities-tab'
import { ComplianceTab } from '@/components/profile/compliance-tab'
import { KYCQuestionnaire } from '@/components/kyc/KYCQuestionnaire'
import { GenericEntityMembersTab } from '@/components/profile/generic-entity-members-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  User,
  Lock,
  Settings,
  Briefcase,
  Building2,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Edit,
  Shield,
  Globe,
  MapPin,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { PersonalKYCSection, type MemberKYCData } from '@/components/profile/personal-kyc-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IndividualKycDisplay, EntityKYCEditDialog, EntityOverviewEditDialog } from '@/components/shared'
import { getCountryName } from '@/components/kyc/country-select'
import {
  ProfileOverviewShell,
  OverviewSectionCard,
} from '@/components/profile/overview'
import {
  extractApprovedKycDocumentMetadata,
  type ApprovedKycDocumentMetadata,
} from '@/lib/kyc/approved-document-metadata'

// Types for investor entity data passed from server
type InvestorInfo = {
  id: string
  legal_name: string
  display_name: string | null
  type: string | null
  status: string | null
  account_approval_status: string | null
  kyc_status: string | null
  onboarding_status: string | null
  country: string | null
  country_of_incorporation: string | null
  tax_residency: string | null
  email: string | null
  phone: string | null
  website: string | null
  registered_address: string | null
  city: string | null
  representative_name: string | null
  representative_title: string | null
  is_professional_investor: boolean | null
  is_qualified_purchaser: boolean | null
  aml_risk_rating: string | null
  logo_url: string | null
  // Individual KYC fields
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  name_suffix: string | null
  date_of_birth: string | null
  country_of_birth: string | null
  nationality: string | null
  // Phone numbers
  phone_mobile: string | null
  phone_office: string | null
  // Residential address (for individuals)
  residential_street: string | null
  residential_line_2: string | null
  residential_city: string | null
  residential_state: string | null
  residential_postal_code: string | null
  residential_country: string | null
  // Registered address (for entities)
  registered_address_line_1: string | null
  registered_address_line_2: string | null
  registered_city: string | null
  registered_state: string | null
  registered_postal_code: string | null
  registered_country: string | null
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
  // Additional KYC fields
  middle_initial?: string | null
  proof_of_address_date?: string | null
  proof_of_address_expiry?: string | null
  tax_id_number?: string | null
}

type InvestorUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
}

interface ProfilePageClientProps {
  userEmail?: string
  profile: {
    id: string
    email: string | null
    display_name: string | null
    full_name?: string | null
    title: string | null
    avatar_url: string | null
    phone: string | null
    office_location: string | null
    bio: string | null
    role: string
    created_at: string
  }
  variant?: 'investor' | 'staff'
  defaultTab?: string
  investorInfo?: InvestorInfo | null
  investorUserInfo?: InvestorUserInfo | null
  memberInfo?: MemberKYCData | null
  latestEntityInfoSnapshot?: Record<string, unknown> | null
  latestPersonalInfoSnapshot?: Record<string, unknown> | null
  accountRequestInfo?: Record<string, unknown> | null
}

// Status badge configurations
const STATUS_BADGES: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Profile Live', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
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
}

const normalizeEntityFieldValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

const pickSnapshotValue = (
  snapshot: Record<string, unknown> | null | undefined,
  keys: readonly string[]
): unknown => {
  if (!snapshot) return null
  for (const key of keys) {
    const value = snapshot[key]
    if (value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')) {
      return value
    }
  }
  return null
}

const hasEntityOverviewChanges = (
  investorInfo: InvestorInfo | null | undefined,
  snapshot: Record<string, unknown> | null | undefined
): boolean => {
  if (!investorInfo) return false
  if (!snapshot || Object.keys(snapshot).length === 0) return true

  const checks: Array<{ current: unknown; keys: readonly string[] }> = [
    { current: investorInfo.display_name, keys: ['display_name'] },
    { current: investorInfo.legal_name, keys: ['legal_name'] },
    { current: investorInfo.country_of_incorporation, keys: ['country_of_incorporation'] },
    { current: investorInfo.email, keys: ['email', 'contact_email', 'primary_contact_email'] },
    { current: investorInfo.phone, keys: ['phone', 'contact_phone', 'primary_contact_phone'] },
    { current: investorInfo.phone_mobile, keys: ['phone_mobile'] },
    { current: investorInfo.phone_office, keys: ['phone_office'] },
    { current: investorInfo.website, keys: ['website'] },
    {
      current: investorInfo.registered_address_line_1,
      keys: ['registered_address_line_1', 'address_line_1', 'registered_address'],
    },
    { current: investorInfo.registered_address_line_2, keys: ['registered_address_line_2', 'address_line_2'] },
    { current: investorInfo.registered_city, keys: ['registered_city', 'city'] },
    { current: investorInfo.registered_state, keys: ['registered_state', 'state_province'] },
    { current: investorInfo.registered_postal_code, keys: ['registered_postal_code', 'postal_code'] },
    { current: investorInfo.registered_country, keys: ['registered_country', 'country'] },
  ]

  return checks.some(
    ({ current, keys }) =>
      normalizeEntityFieldValue(current) !==
      normalizeEntityFieldValue(pickSnapshotValue(snapshot, keys))
  )
}

const hasPersonalInfoOverviewChanges = (
  investorInfo: InvestorInfo | null | undefined,
  snapshot: Record<string, unknown> | null | undefined
): boolean => {
  if (!investorInfo) return false
  if (!snapshot || Object.keys(snapshot).length === 0) return true

  const checks: Array<{ current: unknown; keys: readonly string[] }> = [
    { current: investorInfo.first_name, keys: ['first_name'] },
    { current: investorInfo.middle_name, keys: ['middle_name'] },
    { current: investorInfo.last_name, keys: ['last_name'] },
    { current: investorInfo.name_suffix, keys: ['name_suffix'] },
    { current: investorInfo.date_of_birth, keys: ['date_of_birth'] },
    { current: investorInfo.country_of_birth, keys: ['country_of_birth'] },
    { current: investorInfo.nationality, keys: ['nationality'] },
    { current: investorInfo.email, keys: ['email'] },
    { current: investorInfo.phone_mobile, keys: ['phone_mobile'] },
    { current: investorInfo.phone_office, keys: ['phone_office'] },
    { current: investorInfo.residential_street, keys: ['residential_street', 'address_line_1'] },
    { current: investorInfo.residential_line_2, keys: ['residential_line_2', 'address_line_2'] },
    { current: investorInfo.residential_city, keys: ['residential_city', 'city'] },
    { current: investorInfo.residential_state, keys: ['residential_state', 'state_province'] },
    { current: investorInfo.residential_postal_code, keys: ['residential_postal_code', 'postal_code'] },
    { current: investorInfo.residential_country, keys: ['residential_country', 'country'] },
    { current: investorInfo.is_us_citizen, keys: ['is_us_citizen'] },
    { current: investorInfo.is_us_taxpayer, keys: ['is_us_taxpayer'] },
    { current: investorInfo.us_taxpayer_id, keys: ['us_taxpayer_id'] },
    { current: investorInfo.country_of_tax_residency, keys: ['country_of_tax_residency', 'tax_residency'] },
    { current: investorInfo.tax_id_number, keys: ['tax_id_number'] },
  ]

  return checks.some(
    ({ current, keys }) =>
      normalizeEntityFieldValue(current) !==
      normalizeEntityFieldValue(pickSnapshotValue(snapshot, keys))
  )
}

export function ProfilePageClient({
  userEmail,
  profile: initialProfile,
  variant = 'investor',
  defaultTab = 'overview',
  investorInfo,
  investorUserInfo,
  memberInfo,
  latestEntityInfoSnapshot,
  latestPersonalInfoSnapshot,
  accountRequestInfo,
}: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showEntityOverviewDialog, setShowEntityOverviewDialog] = useState(false)
  const [isSubmittingEntityKyc, setIsSubmittingEntityKyc] = useState(false)
  const [isSubmittingPersonalKyc, setIsSubmittingPersonalKyc] = useState(false)
  const [approvedDocMetadata, setApprovedDocMetadata] = useState<ApprovedKycDocumentMetadata | null>(null)
  // Use server-passed investorInfo instead of client-side fetching
  const hasInvestorEntity = !!investorInfo
  const isIndividual = investorInfo?.type === 'individual'
  const isEntity = hasInvestorEntity && investorInfo?.type !== 'individual'
  const isStaff = variant === 'staff'
  const entityKycStatus = (investorInfo?.kyc_status || '').toLowerCase()
  const activeRequestSections = Array.isArray(accountRequestInfo?.sections)
    ? accountRequestInfo.sections.filter((section): section is string => typeof section === 'string')
    : []
  const hasActiveAccountInfoRequest = !!accountRequestInfo
  const requestTouchesEntityInfo = !hasActiveAccountInfoRequest
    ? false
    : activeRequestSections.length === 0 ||
      activeRequestSections.includes('general') ||
      activeRequestSections.includes('entity_info') ||
      activeRequestSections.includes('documents') ||
      activeRequestSections.includes('members')
  const requestTouchesPersonalInfo = !hasActiveAccountInfoRequest
    ? false
    : activeRequestSections.length === 0 ||
      activeRequestSections.includes('general') ||
      activeRequestSections.includes('personal_info') ||
      activeRequestSections.includes('documents') ||
      activeRequestSections.includes('members')
  const canSubmitEntityInfo = !!(investorUserInfo?.is_primary || investorUserInfo?.role === 'admin')
  const entityHasUnsubmittedChanges = isEntity
    ? hasEntityOverviewChanges(investorInfo, latestEntityInfoSnapshot)
    : false
  const personalHasUnsubmittedChanges = isIndividual
    ? hasPersonalInfoOverviewChanges(investorInfo, latestPersonalInfoSnapshot)
    : false
  const personalSubmitInFlight = ['submitted', 'pending_review', 'under_review'].includes(entityKycStatus)
  const entitySubmitButtonLabel =
    hasActiveAccountInfoRequest && requestTouchesEntityInfo
      ? 'Resubmit Entity Info'
      : 'Submit Entity Info'

  // Submit entity KYC for review
  const handleSubmitEntityKyc = async () => {
    setIsSubmittingEntityKyc(true)
    try {
      if (!investorInfo?.id) {
        throw new Error('Investor entity not found')
      }

      const response = await fetch('/api/me/entity-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'investor',
          entityId: investorInfo.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit entity KYC')
      }

      toast.success('Entity information submitted')
      window.location.reload()
    } catch (error) {
      console.error('Error submitting entity KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit entity KYC')
    } finally {
      setIsSubmittingEntityKyc(false)
    }
  }

  // Submit personal info for individual investor review.
  const handleSubmitPersonalKyc = async () => {
    setIsSubmittingPersonalKyc(true)
    try {
      const response = await fetch('/api/investors/me/submit-personal-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit personal KYC')
      }

      toast.success('Personal information submitted and approved')
      window.location.reload()
    } catch (error) {
      console.error('Error submitting personal KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit personal KYC')
    } finally {
      setIsSubmittingPersonalKyc(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadApprovedDocumentMetadata = async () => {
      if (!hasInvestorEntity || !isIndividual) {
        setApprovedDocMetadata(null)
        return
      }

      try {
        const response = await fetch('/api/investors/me/kyc-submissions', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (cancelled) return

        const submissions = Array.isArray(data?.submissions) ? data.submissions : []
        setApprovedDocMetadata(
          extractApprovedKycDocumentMetadata(submissions, {
            memberColumn: 'investor_member_id',
            memberId: null,
          })
        )
      } catch (error) {
        if (!cancelled) {
          console.error('[profile-page] Failed to load approved KYC document metadata:', error)
        }
      }
    }

    void loadApprovedDocumentMetadata()

    return () => {
      cancelled = true
    }
  }, [hasInvestorEntity, isIndividual])

  // Debug logging on client
  console.log('[ProfilePageClient] Props received:', {
    variant,
    isStaff,
    hasInvestorEntity,
    isIndividual,
    isEntity,
    investorInfo: investorInfo ? { id: investorInfo.id, legal_name: investorInfo.legal_name, type: investorInfo.type } : null,
  })

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }))
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(prev => ({
      ...prev,
      ...updatedProfile
    }))
  }

  // Get status badges for investor
  const statusBadge = STATUS_BADGES[investorInfo?.status || 'pending'] || STATUS_BADGES.pending
  const StatusIcon = statusBadge.icon
  const kycBadge = KYC_BADGES[investorInfo?.kyc_status || 'pending'] || KYC_BADGES.pending
  const accountApprovalStatusKey = (investorInfo?.account_approval_status || 'pending_onboarding').toLowerCase()
  const accountApprovalBadge = ACCOUNT_APPROVAL_BADGES[accountApprovalStatusKey] || {
    label: 'Account Pending',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  // Staff layout - keep the original grid layout
  if (isStaff) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProfileImageUpload
              currentAvatarUrl={profile.avatar_url}
              userName={profile.display_name || profile.email || 'Staff User'}
              onAvatarUpdate={handleAvatarUpdate}
            />

            {/* Quick Info Card - Staff Only */}
            <div className="mt-6 p-4 border border-border rounded-lg bg-muted/50 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contact
                </p>
                <p className="text-sm mt-1 text-foreground">{profile.email}</p>
                {profile.phone && (
                  <p className="text-sm text-muted-foreground">{profile.phone}</p>
                )}
              </div>

              {profile.office_location && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Office
                  </p>
                  <p className="text-sm mt-1 text-foreground">{profile.office_location}</p>
                </div>
              )}

              {profile.title && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Title
                  </p>
                  <p className="text-sm mt-1 text-foreground">{profile.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <Briefcase className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileForm
                userId={profile.id}
                initialData={profile}
                onUpdate={handleProfileUpdate}
                showStaffFields={true}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <PasswordChangeForm />
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <PreferencesEditor variant="staff" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Investor layout - full-width like Partner profile
  return (
    <div className="space-y-6">
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <ProfileImageUpload
            currentAvatarUrl={profile.avatar_url}
            userName={profile.display_name || profile.email || 'User'}
            onAvatarUpdate={handleAvatarUpdate}
            compact
          />

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {hasInvestorEntity
                ? (investorInfo!.display_name || investorInfo!.legal_name)
                : 'My Profile'
              }
            </h1>
            <p className="text-muted-foreground mt-1">
              {hasInvestorEntity
                ? 'Manage your investor profile, documents, and team'
                : 'Manage your personal profile settings'
              }
            </p>
          </div>
        </div>

        {/* Status Badges */}
        {hasInvestorEntity && (
          <div className="flex items-center gap-2">
            <Badge className={statusBadge.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusBadge.label}
            </Badge>
            <Badge className={accountApprovalBadge.className}>
              {accountApprovalBadge.label}
            </Badge>
            <Badge className={kycBadge.className}>
              {kycBadge.label}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          {hasInvestorEntity && (
            <>
              <TabsTrigger value="kyc" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                KYC
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              {isEntity && (
                <TabsTrigger value="entity-members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Directors/UBOs
                </TabsTrigger>
              )}
              <TabsTrigger value="entities" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Entities
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ProfileOverviewShell>
            {/* Compact User Summary */}
            <div className="rounded-lg border bg-card px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.display_name || 'Not set'}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {profile.email || userEmail}
                  </p>
                </div>
              </div>
              {hasInvestorEntity && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">
                    {investorUserInfo?.role || 'member'}
                  </Badge>
                  {investorUserInfo?.is_primary && (
                    <Badge variant="secondary" className="text-xs">Primary Contact</Badge>
                  )}
                  {investorUserInfo?.can_sign && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      Signatory
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Entity Overview — Full Width */}
            {isEntity && investorInfo && (
              <OverviewSectionCard
                title="Entity Overview"
                description="Legal details, contact information, and registered address"
                icon={Building2}
                contentClassName="space-y-4"
                action={(
                  <Button variant="outline" size="sm" onClick={() => setShowEntityOverviewDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              >
                {/* Entity Information */}
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
                          {(investorInfo.type || 'entity').replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Display Name</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.display_name || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Legal Name</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.legal_name || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Country of Incorporation</p>
                      <p className="mt-1 text-sm font-medium">{getCountryName(investorInfo.country_of_incorporation) || '-'}</p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</p>
                      <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {investorInfo.email || '-'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</p>
                      <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {investorInfo.phone || '-'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Mobile</p>
                      <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {investorInfo.phone_mobile || '-'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Office Phone</p>
                      <p className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {investorInfo.phone_office || '-'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Website</p>
                      <div className="mt-1 text-sm font-medium inline-flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {investorInfo.website ? (
                          <a
                            href={investorInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {investorInfo.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Registered Address */}
                <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Registered Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Address Line 1</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_address_line_1 || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Address Line 2</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_address_line_2 || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">City</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_city || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">State / Province</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_state || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Postal Code</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_postal_code || '-'}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-background p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Country</p>
                      <p className="mt-1 text-sm font-medium">{investorInfo.registered_country || '-'}</p>
                    </div>
                  </div>
                </section>

                {/* Submit Entity Info */}
                <div className="pt-2">
                  {canSubmitEntityInfo ? (
                    <Button
                      onClick={handleSubmitEntityKyc}
                      disabled={isSubmittingEntityKyc}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingEntityKyc ? 'Submitting...' : entitySubmitButtonLabel}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Only primary contacts can submit entity information for review.
                    </p>
                  )}
                  {canSubmitEntityInfo && hasActiveAccountInfoRequest && !requestTouchesEntityInfo && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Current request for more information is focused on personal/member details.
                    </p>
                  )}
                  {canSubmitEntityInfo && hasActiveAccountInfoRequest && requestTouchesEntityInfo && entityHasUnsubmittedChanges && (
                    <p className="text-xs text-muted-foreground mt-2">
                      More information was requested. Update the fields and submit again.
                    </p>
                  )}
                  {canSubmitEntityInfo && !hasActiveAccountInfoRequest && !entityHasUnsubmittedChanges && (
                    <p className="text-xs text-muted-foreground mt-2">
                      No new changes detected. You can still submit if needed.
                    </p>
                  )}
                </div>
              </OverviewSectionCard>
            )}

          {/* Personal KYC Section for Entity Members */}
          {isEntity && investorInfo && (
            <PersonalKYCSection
              memberData={memberInfo || null}
              entityType="investor"
              entityId={investorInfo.id}
              onRefresh={() => window.location.reload()}
              profileEmail={profile.email}
              profileName={profile.display_name || profile.full_name}
            />
          )}

          {/* Individual KYC Info Display */}
          {isIndividual && investorInfo && (
            <div className="space-y-4">
              <IndividualKycDisplay
                data={{
                  first_name: investorInfo.first_name,
                  middle_name: investorInfo.middle_name,
                  last_name: investorInfo.last_name,
                  name_suffix: investorInfo.name_suffix,
                  date_of_birth: investorInfo.date_of_birth,
                  country_of_birth: investorInfo.country_of_birth,
                  nationality: investorInfo.nationality,
                  email: investorInfo.email,
                  phone_mobile: investorInfo.phone_mobile,
                  phone_office: investorInfo.phone_office,
                  residential_street: investorInfo.residential_street,
                  residential_city: investorInfo.residential_city,
                  residential_state: investorInfo.residential_state,
                  residential_postal_code: investorInfo.residential_postal_code,
                  residential_country: investorInfo.residential_country,
                  is_us_citizen: investorInfo.is_us_citizen,
                  is_us_taxpayer: investorInfo.is_us_taxpayer,
                  us_taxpayer_id: investorInfo.us_taxpayer_id,
                  country_of_tax_residency: investorInfo.country_of_tax_residency,
                  id_type: approvedDocMetadata?.id_type || investorInfo.id_type,
                  id_number: approvedDocMetadata?.id_number || investorInfo.id_number,
                  id_issue_date: approvedDocMetadata?.id_issue_date || investorInfo.id_issue_date,
                  id_expiry_date: approvedDocMetadata?.id_expiry_date || investorInfo.id_expiry_date,
                  id_issuing_country: approvedDocMetadata?.id_issuing_country || investorInfo.id_issuing_country,
                  proof_of_address_date: approvedDocMetadata?.proof_of_address_date || investorInfo.proof_of_address_date || null,
                }}
                onEdit={() => setShowKycDialog(true)}
                title="Personal KYC Information"
              />

              {(personalHasUnsubmittedChanges || personalSubmitInFlight || hasActiveAccountInfoRequest) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Submit Personal Information for Review</p>
                        <p className="text-sm text-muted-foreground">
                          Required before final KYC completion and account activation.
                        </p>
                        {hasActiveAccountInfoRequest && requestTouchesPersonalInfo && (
                          <p className="text-xs text-muted-foreground">
                            More information was requested on your personal or member details.
                          </p>
                        )}
                        {personalSubmitInFlight && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Send className="h-3 w-3 mr-1" />
                            Personal Info Submitted
                          </Badge>
                        )}
                        {!personalSubmitInFlight && !personalHasUnsubmittedChanges && (
                          <p className="text-xs text-muted-foreground">No personal information changes to submit.</p>
                        )}
                      </div>
                      <Button
                        onClick={handleSubmitPersonalKyc}
                        disabled={
                          isSubmittingPersonalKyc ||
                          personalSubmitInFlight ||
                          !personalHasUnsubmittedChanges ||
                          (hasActiveAccountInfoRequest && !requestTouchesPersonalInfo)
                        }
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingPersonalKyc ? 'Submitting...' : 'Submit Personal Info'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* If no investor entity, show basic profile edit */}
          {!hasInvestorEntity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  userId={profile.id}
                  initialData={profile}
                  onUpdate={handleProfileUpdate}
                  showStaffFields={false}
                />
              </CardContent>
            </Card>
          )}
          </ProfileOverviewShell>
        </TabsContent>

        {/* KYC Tab */}
        {hasInvestorEntity && (
          <TabsContent value="kyc" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">KYC Documents</h2>
              <p className="text-muted-foreground">
                Upload required identity and verification documents.
              </p>
            </div>

            {/* KYC Documents */}
            <KYCDocumentsTab />
          </TabsContent>
        )}

        {/* Compliance Tab */}
        {hasInvestorEntity && (
          <TabsContent value="compliance" className="space-y-6">
            <ComplianceTab />

            {/* Compliance Questionnaire */}
            <div className="pt-6 border-t">
              <KYCQuestionnaire />
            </div>
          </TabsContent>
        )}

        {/* Members Tab - Portal Team Members (ALL investors) */}
        {hasInvestorEntity && investorInfo && (
          <TabsContent value="members" className="space-y-4">
            <MembersManagementTab
              entityType="investor"
              entityId={investorInfo.id}
              entityName={investorInfo.display_name || investorInfo.legal_name}
              showSignatoryOption={isEntity}
              canManageMembers={investorUserInfo?.role === 'admin' || investorUserInfo?.is_primary}
            />
          </TabsContent>
        )}

        {/* Directors/UBOs Tab - Entity Members for KYC (only for entity type investors) */}
        {isEntity && investorInfo && (
          <TabsContent value="entity-members" className="space-y-4">
            <GenericEntityMembersTab
              entityType="investor"
              entityId={investorInfo.id}
              entityName={investorInfo.display_name || investorInfo.legal_name}
              apiEndpoint="/api/investors/me/members"
              canManage={investorUserInfo?.role === 'admin' || investorUserInfo?.is_primary}
              title="Directors, UBOs & Signatories"
              description="Manage directors, beneficial owners (>25% ownership), and authorized signatories with full KYC information"
            />
          </TabsContent>
        )}

        {/* Entities Tab */}
        {hasInvestorEntity && (
          <TabsContent value="entities" className="space-y-4">
            <CounterpartyEntitiesTab />
          </TabsContent>
        )}


        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <PasswordChangeForm />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <PreferencesEditor variant="investor" />
        </TabsContent>
      </Tabs>

      {/* KYC Edit Dialog for Individual Investors */}
      {isIndividual && investorInfo && (
        <EntityKYCEditDialog
          open={showKycDialog}
          onOpenChange={setShowKycDialog}
          entityType="investor"
          entityId={investorInfo.id}
          entityName={investorInfo.display_name || investorInfo.legal_name}
          initialData={{
            first_name: investorInfo.first_name ?? (profile.display_name?.split(' ')[0]) ?? undefined,
            middle_name: investorInfo.middle_name ?? undefined,
            last_name: investorInfo.last_name ?? (profile.display_name?.split(' ').slice(1).join(' ')) ?? undefined,
            name_suffix: investorInfo.name_suffix ?? undefined,
            date_of_birth: investorInfo.date_of_birth ?? undefined,
            nationality: investorInfo.nationality ?? undefined,
            country_of_birth: investorInfo.country_of_birth ?? undefined,
            email: investorInfo.email ?? profile.email ?? undefined,
            phone_mobile: investorInfo.phone_mobile ?? undefined,
            phone_office: investorInfo.phone_office ?? undefined,
            is_us_citizen: investorInfo.is_us_citizen === true,
            is_us_taxpayer: investorInfo.is_us_taxpayer === true,
            us_taxpayer_id: investorInfo.us_taxpayer_id ?? undefined,
            country_of_tax_residency: investorInfo.country_of_tax_residency ?? undefined,
            residential_street: investorInfo.residential_street ?? undefined,
            residential_city: investorInfo.residential_city ?? undefined,
            residential_state: investorInfo.residential_state ?? undefined,
            residential_postal_code: investorInfo.residential_postal_code ?? undefined,
            residential_country: investorInfo.residential_country ?? undefined,
          }}
          apiEndpoint="/api/investors/me"
          onSuccess={() => window.location.reload()}
        />
      )}

      {isEntity && investorInfo && (
        <EntityOverviewEditDialog
          open={showEntityOverviewDialog}
          onOpenChange={setShowEntityOverviewDialog}
          entityName={investorInfo.display_name || investorInfo.legal_name}
          initialData={{
            display_name: investorInfo.display_name,
            legal_name: investorInfo.legal_name,
            country_of_incorporation: investorInfo.country_of_incorporation,
            email: investorInfo.email,
            phone: investorInfo.phone,
            phone_mobile: investorInfo.phone_mobile,
            phone_office: investorInfo.phone_office,
            website: investorInfo.website,
            address_line_1: investorInfo.registered_address_line_1,
            address_line_2: investorInfo.registered_address_line_2,
            city: investorInfo.registered_city,
            state_province: investorInfo.registered_state,
            postal_code: investorInfo.registered_postal_code,
            country: investorInfo.registered_country,
          }}
          apiEndpoint="/api/investors/me"
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
