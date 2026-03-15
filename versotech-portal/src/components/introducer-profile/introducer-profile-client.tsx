'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getCountryName } from '@/components/kyc/country-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Mail,
  Phone,
  UserPlus,
  FileText,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Edit,
  Loader2,
  Lock,
  Settings,
  Save,
  X,
  Camera,
  Globe,
  Calendar,
  AlertCircle,
  Users,
  Bell,
  Send,
  Info,
  ArrowRight,
  XCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

// Import profile components
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { GDPRControls } from '@/components/profile/gdpr-controls'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { IntroducerKYCDocumentsTab } from '@/components/profile/introducer-kyc-documents-tab'
import { GenericEntityMembersTab } from '@/components/profile/generic-entity-members-tab'
import { NoticeContactsTab } from '@/components/profile/notice-contacts-tab'
import { ProfileOverviewShell, OverviewSectionCard, OverviewField, OverviewFieldGrid } from '@/components/profile/overview'

// Import shared KYC dialog components
import { EntityKYCEditDialog, EntityAddressEditDialog, IndividualKycDisplay } from '@/components/shared'
import { PersonalKYCSection, MemberKYCData } from '@/components/profile/personal-kyc-section'

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
  residential_city: string | null
  residential_state: string | null
  residential_postal_code: string | null
  residential_country: string | null
  // Entity fields
  country_of_incorporation: string | null
  registration_number: string | null
  tax_id: string | null
  // Additional KYC fields
  residential_line_2: string | null
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

type ActiveAgreement = {
  id: string
  agreement_type: string
  commission_bps: number
  territory: string
  status: string
  effective_date: string | null
  expiry_date: string | null
}

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface IntroducerProfileClientProps {
  defaultTab?: string
  defaultAction?: string | null
  userEmail: string
  profile: Profile | null
  introducerInfo: IntroducerInfo | null
  introducerUserInfo: IntroducerUserInfo
  activeAgreement: ActiveAgreement | null
  introductionCount: number
  memberInfo: MemberKYCData | null
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

// Editable field component
function EditableField({
  label,
  value,
  field,
  isEditing,
  editValue,
  onEditChange,
  type = 'text',
  disabled = false,
}: {
  label: string
  value: string | null | undefined
  field: string
  isEditing: boolean
  editValue: string
  onEditChange: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel' | 'textarea'
  disabled?: boolean
}) {
  if (isEditing && !disabled) {
    if (type === 'textarea') {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Textarea
            value={editValue}
            onChange={(e) => onEditChange(field, e.target.value)}
            className="text-sm min-h-[80px]"
          />
        </div>
      )
    }
    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {type === 'tel' ? (
          <PhoneInput
            value={editValue}
            onChange={(val) => onEditChange(field, val || '')}
            className="text-sm"
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => onEditChange(field, e.target.value)}
            className="text-sm"
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}

export function IntroducerProfileClient({
  defaultTab = 'profile',
  defaultAction,
  userEmail,
  profile,
  introducerInfo,
  introducerUserInfo,
  activeAgreement,
  introductionCount,
  memberInfo,
  introducerAccountApprovalReadiness,
}: IntroducerProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSubmittingAccountApproval, setIsSubmittingAccountApproval] = useState(false)
  const [showRequestInfoDetails, setShowRequestInfoDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // KYC Edit Dialog state
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [isSubmittingEntityKyc, setIsSubmittingEntityKyc] = useState(false)
  const canEditEntityProfile = introducerUserInfo.role === 'admin' || introducerUserInfo.is_primary
  const canSubmitAccountApproval = canEditEntityProfile
  const readiness = introducerAccountApprovalReadiness || null
  const missingAccountKycItems = readiness?.missingItems || []
  const hasPendingAccountApproval = readiness?.hasPendingApproval || false
  const latestAccountRequestInfo = readiness?.latestRequestInfo || null
  const isAccountApprovalReady = readiness?.isReady || false

  // Edit state
  const [editData, setEditData] = useState({
    contact_name: introducerInfo?.contact_name || '',
    email: introducerInfo?.email || '',
    notes: introducerInfo?.notes || '',
  })

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/introducers/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
      // Refresh the page to show updated data
      window.location.reload()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitEntityKyc = async () => {
    if (!introducerInfo?.id) return

    setIsSubmittingEntityKyc(true)
    try {
      const response = await fetch('/api/me/entity-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'introducer',
          entityId: introducerInfo.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit entity KYC')
      }

      toast.success('Entity KYC saved')
      window.location.reload()
    } catch (error) {
      console.error('[introducer-profile] Failed to submit entity KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit entity KYC')
    } finally {
      setIsSubmittingEntityKyc(false)
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

  const handleCancelEdit = () => {
    setEditData({
      contact_name: introducerInfo?.contact_name || '',
      email: introducerInfo?.email || '',
      notes: introducerInfo?.notes || '',
    })
    setIsEditing(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/introducers/me/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload logo')
      }

      toast.success('Logo updated successfully')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const formatCommission = (bps: number | null | undefined) => {
    if (bps === null || bps === undefined) return '-'
    return `${(bps / 100).toFixed(2)}%`
  }

  useEffect(() => {
    if (!defaultAction) return

    if (defaultAction === 'edit-individual-kyc') {
      setShowKycDialog(true)
    } else if (defaultAction === 'edit-entity-overview') {
      setIsEditing(true)
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('action')
      url.searchParams.delete('memberId')
      window.history.replaceState({}, '', url.toString())
    }
  }, [defaultAction])

  const accountApprovalStatusKey = (introducerInfo?.account_approval_status || 'pending_onboarding').toLowerCase()
  const accountApprovalBadge = ACCOUNT_APPROVAL_BADGES[accountApprovalStatusKey] || {
    label: 'Account Pending',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const kycBadge = KYC_BADGES[introducerInfo?.kyc_status || 'pending'] || KYC_BADGES.pending
  const hideAccountApprovalSection =
    accountApprovalStatusKey === 'approved' || accountApprovalStatusKey === 'rejected'
  const showRequestInfoBadge =
    !!latestAccountRequestInfo && !hasPendingAccountApproval && !hideAccountApprovalSection
  const accountApprovalSubmitDisabled =
    isSubmittingAccountApproval ||
    !canSubmitAccountApproval ||
    hasPendingAccountApproval ||
    !isAccountApprovalReady

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="h-20 w-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {introducerInfo?.logo_url ? (
                <Image
                  src={introducerInfo.logo_url}
                  alt={introducerInfo.legal_name || 'Logo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserPlus className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={!canEditEntityProfile || isUploadingLogo}
            />
            {canEditEntityProfile && (
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{introducerInfo?.legal_name || 'Introducer Profile'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                'text-xs',
                STATUS_STYLES[introducerInfo?.status || 'inactive']
              )}>
                {introducerInfo?.status || 'Unknown'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {introducerUserInfo.role} {introducerUserInfo.is_primary && '(Primary)'}
              </span>
            </div>
          </div>
        </div>

        {introducerInfo && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={accountApprovalBadge.className}>{accountApprovalBadge.label}</Badge>
            <Badge className={kycBadge.className}>{kycBadge.label}</Badge>
          </div>
        )}

        <div className="flex gap-2">
          {canEditEntityProfile && isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : canEditEntityProfile ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Introductions</p>
                <p className="text-2xl font-bold">{introductionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold">
                  {formatCommission(activeAgreement?.commission_bps || introducerInfo?.default_commission_bps)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agreement Status</p>
                <div className="flex items-center gap-2">
                  {activeAgreement ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">No Active Agreement</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-4" id="introducer-profile-tabs">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="agreement" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Agreement
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          {introducerInfo?.type === 'entity' && (
            <TabsTrigger value="entity-members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Directors/UBOs
            </TabsTrigger>
          )}
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC Documents
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notices" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notices
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <ProfileOverviewShell>
          <OverviewSectionCard
            title="Introducer Information"
            description="Your introducer entity details"
            icon={Building2}
            contentClassName="space-y-6"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Legal Name</p>
                  <p className="text-sm font-medium">{introducerInfo?.legal_name || '-'}</p>
                </div>

                <EditableField
                  label="Contact Person"
                  value={introducerInfo?.contact_name}
                  field="contact_name"
                  isEditing={isEditing}
                  editValue={editData.contact_name}
                  onEditChange={handleEditChange}
                />

                <EditableField
                  label="Email"
                  value={introducerInfo?.email}
                  field="email"
                  isEditing={isEditing}
                  editValue={editData.email}
                  onEditChange={handleEditChange}
                  type="email"
                />

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Default Commission</p>
                  <p className="text-sm font-medium">
                    {formatCommission(introducerInfo?.default_commission_bps)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Payment Terms</p>
                  <p className="text-sm font-medium">{introducerInfo?.payment_terms || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {introducerInfo?.created_at ? formatDate(introducerInfo.created_at) : '-'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <EditableField
                  label="Notes"
                  value={introducerInfo?.notes}
                  field="notes"
                  isEditing={isEditing}
                  editValue={editData.notes}
                  onEditChange={handleEditChange}
                  type="textarea"
                />
              </div>
          </OverviewSectionCard>

          <OverviewSectionCard
            title="Your Account"
            description="Your personal account linked to this introducer"
            icon={Mail}
          >
            <OverviewFieldGrid>
              <OverviewField label="Name" value={profile?.full_name || '-'} />
              <OverviewField label="Email" value={userEmail} />
              <OverviewField label="Role" value={introducerUserInfo.role} valueClassName="capitalize" />
              <OverviewField label="Can Sign Documents" value={introducerUserInfo.can_sign ? 'Yes' : 'No'} />
            </OverviewFieldGrid>
          </OverviewSectionCard>
          {/* Address & Contact Card */}
          <OverviewSectionCard
            title="Address & Contact"
            description="Registered address and communication details"
            icon={Globe}
            action={
              canEditEntityProfile ? (
                <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : undefined
            }
          >
            <OverviewFieldGrid>
              <OverviewField label="Address" value={introducerInfo?.address_line_1 || '-'} />
              <OverviewField label="Address (Optional)" value={introducerInfo?.address_line_2 || '-'} />
              <OverviewField label="City" value={introducerInfo?.city || '-'} />
              <OverviewField label="State / Province" value={introducerInfo?.state_province || '-'} />
              <OverviewField label="Postal Code" value={introducerInfo?.postal_code || '-'} />
              <OverviewField label="Country" value={getCountryName(introducerInfo?.country) || '-'} />
              <OverviewField label="Phone" value={introducerInfo?.phone || introducerInfo?.phone_mobile || '-'} />
              <OverviewField
                label="Website"
                value={
                  introducerInfo?.website ? (
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
                  )
                }
              />
            </OverviewFieldGrid>
          </OverviewSectionCard>

          {/* Personal KYC Section - For the logged-in user's member record */}
          {introducerInfo && (
            <PersonalKYCSection
              memberData={memberInfo}
              entityType="introducer"
              entityId={introducerInfo.id}
              onRefresh={() => window.location.reload()}
              profileEmail={profile?.email || userEmail}
              profileName={profile?.full_name}
              autoOpenEdit={defaultAction === 'edit-personal-kyc'}
            />
          )}

          {/* Individual KYC Card (only for individual introducers) - Full Display */}
          {introducerInfo?.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: introducerInfo?.first_name,
                middle_name: introducerInfo?.middle_name,
                last_name: introducerInfo?.last_name,
                name_suffix: introducerInfo?.name_suffix,
                date_of_birth: introducerInfo?.date_of_birth,
                country_of_birth: introducerInfo?.country_of_birth,
                nationality: introducerInfo?.nationality,
                email: introducerInfo?.email,
                phone_mobile: introducerInfo?.phone_mobile,
                phone_office: introducerInfo?.phone_office,
                residential_street: introducerInfo?.residential_street,
                residential_city: introducerInfo?.residential_city,
                residential_state: introducerInfo?.residential_state,
                residential_postal_code: introducerInfo?.residential_postal_code,
                residential_country: introducerInfo?.residential_country,
                is_us_citizen: introducerInfo?.is_us_citizen,
                is_us_taxpayer: introducerInfo?.is_us_taxpayer,
                us_taxpayer_id: introducerInfo?.us_taxpayer_id,
                country_of_tax_residency: introducerInfo?.country_of_tax_residency,
                tax_id_number: introducerInfo?.tax_id,
                id_type: introducerInfo?.id_type,
                id_number: introducerInfo?.id_number,
                id_issue_date: introducerInfo?.id_issue_date,
                id_expiry_date: introducerInfo?.id_expiry_date,
                id_issuing_country: introducerInfo?.id_issuing_country,
              }}
              onEdit={() => setShowKycDialog(true)}
              showEditButton={canEditEntityProfile}
              title="Personal KYC Information"
            />
          )}

          {!hideAccountApprovalSection && (
            <Card className="overflow-hidden">
              <div className={`px-6 py-2.5 flex items-center gap-2 ${
                hasPendingAccountApproval
                  ? 'bg-blue-50 border-b border-blue-100'
                  : isAccountApprovalReady
                    ? 'bg-emerald-50 border-b border-emerald-100'
                    : showRequestInfoBadge
                      ? 'bg-red-50 border-b border-red-100'
                      : 'bg-amber-50 border-b border-amber-100'
              }`}>
                {hasPendingAccountApproval ? (
                  <>
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Under Review</span>
                  </>
                ) : isAccountApprovalReady ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Ready to Submit</span>
                  </>
                ) : showRequestInfoBadge ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Action Required</span>
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
                  Complete your profile and KYC documents so your introducer account can be activated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {introducerInfo?.type === 'entity'
                    ? 'We require your entity information, entity KYC documents, and the KYC for all relevant members before your introducer account can be approved.'
                    : 'We require your personal information, proof of identification, and proof of address before your introducer account can be approved.'}
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
                            Requested on {new Date(latestAccountRequestInfo.requestedAt).toLocaleString()}
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
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.missingItems.join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
                    Your introducer KYC file is complete and ready for account activation review.
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {hasPendingAccountApproval
                      ? 'Your account is currently under review.'
                      : canSubmitAccountApproval
                        ? 'Primary contacts or introducer admins can submit the account once everything is complete.'
                        : 'Only primary contacts or introducer admins can submit the account for approval.'}
                  </div>
                  {hasPendingAccountApproval ? (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Under review by the CEO.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSubmitAccountForApproval}
                      disabled={accountApprovalSubmitDisabled}
                      className={isAccountApprovalReady && canSubmitAccountApproval ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    >
                      {isSubmittingAccountApproval ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit for Approval
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          </ProfileOverviewShell>
        </TabsContent>

        {/* Agreement Tab */}
        <TabsContent value="agreement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Active Agreement
              </CardTitle>
              <CardDescription>
                Your current fee agreement with the arranger
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAgreement ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Agreement Type</p>
                    <p className="text-sm font-medium capitalize">{activeAgreement.agreement_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="text-sm font-medium">{formatCommission(activeAgreement.commission_bps)}</p>
                  </div>
                  <div className="space-y-1 flex items-start gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Territory</p>
                      <p className="text-sm font-medium">{activeAgreement.territory}</p>
                    </div>
                  </div>
                  <div className="space-y-1 flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Effective Date</p>
                      <p className="text-sm font-medium">
                        {activeAgreement.effective_date ? formatDate(activeAgreement.effective_date) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="text-sm font-medium">
                      {activeAgreement.expiry_date ? formatDate(activeAgreement.expiry_date) : 'No expiry'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {activeAgreement.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Agreement</h3>
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t have an active fee agreement. Please contact the arranger to set one up.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/versotech_main/introducer-agreements">View All Agreements</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {introducerInfo && (
            <MembersManagementTab
              entityType="introducer"
              entityId={introducerInfo.id}
              entityName={introducerInfo.legal_name || 'Introducer'}
              showSignatoryOption={true}
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
            />
          </TabsContent>
        )}

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-4">
          {introducerInfo?.type !== 'individual' &&
            !['approved', 'submitted', 'pending_review'].includes(introducerInfo?.kyc_status || '') && (
            <Card>
              <CardContent className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Submit company information</p>
                  <p className="text-sm text-muted-foreground">
                    Required to complete company KYC and prepare the account for approval.
                  </p>
                </div>
                {(introducerUserInfo.role === 'admin' || introducerUserInfo.is_primary) ? (
                  <Button onClick={handleSubmitEntityKyc} disabled={isSubmittingEntityKyc} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmittingEntityKyc ? 'Submitting...' : 'Submit company information'}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only primary contacts or introducer admins can submit company information for review.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {introducerInfo && (
            <IntroducerKYCDocumentsTab
              introducerId={introducerInfo.id}
              introducerName={introducerInfo.legal_name || undefined}
              kycStatus={introducerInfo.kyc_status || undefined}
              entityType={introducerInfo.type}
            />
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <PasswordChangeForm />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <PreferencesEditor />
          <GDPRControls />
        </TabsContent>


        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-4">
          <NoticeContactsTab apiEndpoint="/api/introducers/me/notice-contacts" />
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
            last_name: introducerInfo?.last_name ?? undefined,
            name_suffix: introducerInfo?.name_suffix ?? undefined,
            date_of_birth: introducerInfo?.date_of_birth ?? undefined,
            nationality: introducerInfo?.nationality ?? undefined,
            country_of_birth: introducerInfo?.country_of_birth ?? undefined,
            is_us_citizen: introducerInfo?.is_us_citizen === true,
            is_us_taxpayer: introducerInfo?.is_us_taxpayer === true,
            us_taxpayer_id: introducerInfo?.us_taxpayer_id ?? undefined,
            country_of_tax_residency: introducerInfo?.country_of_tax_residency ?? undefined,
            id_type: introducerInfo?.id_type as 'passport' | 'national_id' | 'drivers_license' | 'residence_permit' | undefined,
            id_number: introducerInfo?.id_number ?? undefined,
            id_issue_date: introducerInfo?.id_issue_date ?? undefined,
            id_expiry_date: introducerInfo?.id_expiry_date ?? undefined,
            id_issuing_country: introducerInfo?.id_issuing_country ?? undefined,
            residential_street: introducerInfo?.residential_street ?? undefined,
            residential_city: introducerInfo?.residential_city ?? undefined,
            residential_state: introducerInfo?.residential_state ?? undefined,
            residential_postal_code: introducerInfo?.residential_postal_code ?? undefined,
            residential_country: introducerInfo?.residential_country ?? undefined,
          }}
          apiEndpoint="/api/introducers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}

      <EntityAddressEditDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        entityType="introducer"
        entityName={introducerInfo?.legal_name || introducerInfo?.contact_name || undefined}
        initialData={{
          address: introducerInfo?.address_line_1 ?? undefined,
          address_2: introducerInfo?.address_line_2 ?? undefined,
          city: introducerInfo?.city ?? undefined,
          state_province: introducerInfo?.state_province ?? undefined,
          postal_code: introducerInfo?.postal_code ?? undefined,
          country: introducerInfo?.country ?? undefined,
          email: introducerInfo?.email ?? undefined,
          phone: introducerInfo?.phone ?? undefined,
          phone_mobile: introducerInfo?.phone_mobile ?? undefined,
          phone_office: introducerInfo?.phone_office ?? undefined,
          website: introducerInfo?.website ?? undefined,
        }}
        apiEndpoint="/api/introducers/me/profile"
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
