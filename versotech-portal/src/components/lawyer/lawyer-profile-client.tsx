'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Scale,
  User,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
  Lock,
  Settings,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Shield,
  Clock,
  AlertTriangle,
  Bell,
  Send,
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { GDPRControls } from '@/components/profile/gdpr-controls'
import { LawyerKYCDocumentsTab } from '@/components/profile/lawyer-kyc-documents-tab'
import {
  ProfileOverviewShell,
  OverviewSectionCard,
  OverviewField,
  OverviewFieldGrid,
  OverviewBadgeRow,
} from '@/components/profile/overview'
import { EntityAddressEditDialog, EntityKYCEditDialog, IndividualKycDisplay } from '@/components/shared'
import { GenericEntityMembersTab } from '@/components/profile/generic-entity-members-tab'
import { NoticeContactsTab } from '@/components/profile/notice-contacts-tab'
import { PersonalKYCSection, MemberKYCData } from '@/components/profile/personal-kyc-section'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
  phone: string | null
  email: string | null
  logo_url?: string | null
  kyc_status?: string | null
  primary_contact_name?: string | null
  primary_contact_email?: string | null
  primary_contact_phone?: string | null
  // Address fields
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  // Phone numbers
  phone_mobile?: string | null
  phone_office?: string | null
  website?: string | null
  // Entity fields
  registration_number?: string | null
  country_of_incorporation?: string | null
  tax_id?: string | null
  // Entity type (individual vs entity/firm)
  type?: string | null
  // Individual KYC fields (for individual lawyers)
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  name_suffix?: string | null
  date_of_birth?: string | null
  country_of_birth?: string | null
  nationality?: string | null
  // US Tax compliance
  is_us_citizen?: boolean | null
  is_us_taxpayer?: boolean | null
  us_taxpayer_id?: string | null
  country_of_tax_residency?: string | null
  // ID Document
  id_type?: string | null
  id_number?: string | null
  id_issue_date?: string | null
  id_expiry_date?: string | null
  id_issuing_country?: string | null
  // Residential Address (for individuals)
  residential_street?: string | null
  residential_line_2?: string | null
  residential_city?: string | null
  residential_state?: string | null
  residential_postal_code?: string | null
  residential_country?: string | null
  // Additional KYC fields
  middle_initial?: string | null
  proof_of_address_date?: string | null
  proof_of_address_expiry?: string | null
  tax_id_number?: string | null
}

type LawyerUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
}

interface LawyerProfileClientProps {
  userEmail: string
  profile: Profile | null
  lawyerInfo: LawyerInfo | null
  lawyerUserInfo: LawyerUserInfo
  memberInfo: MemberKYCData | null
}

// KYC Status styling with dark mode support
const KYC_STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: CheckCircle2 },
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
  pending_review: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: AlertTriangle },
  not_started: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', icon: AlertCircle },
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
  icon: Icon,
  disabled = false,
}: {
  label: string
  value: string | null | undefined
  field: string
  isEditing: boolean
  editValue: string
  onEditChange: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel'
  icon?: typeof Mail
  disabled?: boolean
}) {
  if (isEditing && !disabled) {
    return (
      <div className="space-y-2">
        <Label className="text-muted-foreground">{label}</Label>
        <Input
          type={type}
          value={editValue}
          onChange={(e) => onEditChange(field, e.target.value)}
          className="text-sm"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="font-medium flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {value || 'Not set'}
      </div>
    </div>
  )
}

export function LawyerProfileClient({
  userEmail,
  profile,
  lawyerInfo,
  lawyerUserInfo,
  memberInfo
}: LawyerProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [isSubmittingEntityKyc, setIsSubmittingEntityKyc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit state
  const [editData, setEditData] = useState({
    display_name: lawyerInfo?.display_name || '',
    primary_contact_name: lawyerInfo?.primary_contact_name || '',
    primary_contact_email: lawyerInfo?.email || '',
    primary_contact_phone: lawyerInfo?.phone || '',
  })

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/lawyers/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      display_name: lawyerInfo?.display_name || '',
      primary_contact_name: lawyerInfo?.primary_contact_name || '',
      primary_contact_email: lawyerInfo?.email || '',
      primary_contact_phone: lawyerInfo?.phone || '',
    })
    setIsEditing(false)
  }

  const handleSubmitEntityKyc = async () => {
    if (!lawyerInfo?.id) return

    setIsSubmittingEntityKyc(true)
    try {
      const response = await fetch('/api/me/entity-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'lawyer',
          entityId: lawyerInfo.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit entity KYC')
      }

      toast.success('Entity information submitted and approved')
      window.location.reload()
    } catch (error) {
      console.error('[lawyer-profile] Failed to submit entity KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit entity KYC')
    } finally {
      setIsSubmittingEntityKyc(false)
    }
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

      const response = await fetch('/api/lawyers/me/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload logo')
      }

      toast.success('Logo updated successfully')
      window.location.reload()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const kycStatus = lawyerInfo?.kyc_status || 'not_started'
  const kycStyle = KYC_STATUS_STYLES[kycStatus] || KYC_STATUS_STYLES.not_started
  const KycIcon = kycStyle.icon

  const canEdit = lawyerUserInfo.role === 'admin' || lawyerUserInfo.is_primary

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Logo */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="h-20 w-20 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
              {lawyerInfo?.logo_url ? (
                <Image
                  src={lawyerInfo.logo_url}
                  alt={lawyerInfo.firm_name || 'Logo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <Scale className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            {canEdit && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
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
              </>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {lawyerInfo?.firm_name || 'Lawyer Profile'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {lawyerInfo?.is_active ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {lawyerUserInfo.role} {lawyerUserInfo.is_primary && '(Primary)'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
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
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="lawyer-profile-tabs">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          {lawyerInfo?.type !== 'individual' && (
            <TabsTrigger value="entity-members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Directors/UBOs
            </TabsTrigger>
          )}
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC
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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ProfileOverviewShell>
          {/* KYC Status Card */}
          <Card className={cn('border-l-4', kycStatus === 'approved' ? 'border-l-green-500' : kycStatus === 'rejected' ? 'border-l-red-500' : 'border-l-yellow-500')}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', kycStyle.bg)}>
                    <Shield className={cn('h-5 w-5', kycStyle.text)} />
                  </div>
                  <div>
                    <p className="font-medium">KYC Verification Status</p>
                    <p className="text-sm text-muted-foreground">
                      Compliance status managed by VERSO administration
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={cn('capitalize', kycStyle.bg, kycStyle.text)}>
                  <KycIcon className="h-3 w-3 mr-1" />
                  {kycStatus.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OverviewSectionCard
              title="Firm Information"
              description="Your law firm details"
              icon={Building2}
              contentClassName="space-y-4"
            >
              <OverviewField label="Legal Name" value={lawyerInfo?.firm_name || 'Not set'} />
              <EditableField
                label="Display Name"
                value={lawyerInfo?.display_name}
                field="display_name"
                isEditing={isEditing}
                editValue={editData.display_name}
                onEditChange={handleEditChange}
              />
              <EditableField
                label="Contact Person"
                value={lawyerInfo?.primary_contact_name}
                field="primary_contact_name"
                isEditing={isEditing}
                editValue={editData.primary_contact_name}
                onEditChange={handleEditChange}
              />
              <EditableField
                label="Contact Email"
                value={lawyerInfo?.email}
                field="primary_contact_email"
                isEditing={isEditing}
                editValue={editData.primary_contact_email}
                onEditChange={handleEditChange}
                type="email"
                icon={Mail}
              />
              <EditableField
                label="Contact Phone"
                value={lawyerInfo?.phone}
                field="primary_contact_phone"
                isEditing={isEditing}
                editValue={editData.primary_contact_phone}
                onEditChange={handleEditChange}
                type="tel"
                icon={Phone}
              />
            </OverviewSectionCard>

            <OverviewSectionCard
              title="Your Account"
              description="Your personal account linked to this law firm"
              icon={User}
              contentClassName="space-y-4"
            >
              <OverviewField label="Full Name" value={profile?.full_name || 'Not set'} />
              <OverviewField label="Email" value={profile?.email || userEmail} icon={Mail} />
              <div className="space-y-2">
                <Label className="text-muted-foreground">Role</Label>
                <OverviewBadgeRow>
                  <Badge variant="outline" className="capitalize">
                    {lawyerUserInfo.role}
                  </Badge>
                  {lawyerUserInfo.is_primary && (
                    <Badge variant="secondary">Primary Contact</Badge>
                  )}
                  {lawyerUserInfo.can_sign && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      Signatory
                    </Badge>
                  )}
                </OverviewBadgeRow>
              </div>
            </OverviewSectionCard>
          </div>
          {/* Address & Contact Card */}
          <OverviewSectionCard
            title="Address & Contact"
            description="Firm address and communication details"
            icon={Building2}
            action={
              canEdit ? (
                <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : undefined
            }
          >
            <OverviewFieldGrid columns={3}>
              <OverviewField label="Address Line 1" value={lawyerInfo?.address_line_1 || '-'} />
              <OverviewField label="Address Line 2" value={lawyerInfo?.address_line_2 || '-'} />
              <OverviewField label="City" value={lawyerInfo?.city || '-'} />
              <OverviewField label="State / Province" value={lawyerInfo?.state_province || '-'} />
              <OverviewField label="Postal Code" value={lawyerInfo?.postal_code || '-'} />
              <OverviewField label="Country" value={lawyerInfo?.country || '-'} />
              <OverviewField
                label="Phone"
                value={lawyerInfo?.phone || lawyerInfo?.phone_office || lawyerInfo?.phone_mobile || '-'}
                icon={Phone}
              />
              <OverviewField
                label="Website"
                value={
                  lawyerInfo?.website ? (
                    <a
                      href={lawyerInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lawyerInfo.website}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </OverviewFieldGrid>
          </OverviewSectionCard>

          {/* Personal KYC Section - For the logged-in user's member record */}
          {lawyerInfo && (
            <PersonalKYCSection
              memberData={memberInfo}
              entityType="lawyer"
              entityId={lawyerInfo.id}
              onRefresh={() => window.location.reload()}
            />
          )}

          {/* Specializations Card */}
          {lawyerInfo?.specializations?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Specializations
                </CardTitle>
                <CardDescription>
                  Areas of legal expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lawyerInfo.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Individual KYC for Individual Lawyers (solo practitioners) */}
          {lawyerInfo?.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: lawyerInfo.first_name,
                middle_name: lawyerInfo.middle_name,
                last_name: lawyerInfo.last_name,
                name_suffix: lawyerInfo.name_suffix,
                date_of_birth: lawyerInfo.date_of_birth,
                country_of_birth: lawyerInfo.country_of_birth,
                nationality: lawyerInfo.nationality,
                email: lawyerInfo.email,
                phone_mobile: lawyerInfo.phone_mobile,
                phone_office: lawyerInfo.phone_office,
                residential_street: lawyerInfo.residential_street,
                residential_line_2: lawyerInfo.residential_line_2,
                residential_city: lawyerInfo.residential_city,
                residential_state: lawyerInfo.residential_state,
                residential_postal_code: lawyerInfo.residential_postal_code,
                residential_country: lawyerInfo.residential_country,
                is_us_citizen: lawyerInfo.is_us_citizen,
                is_us_taxpayer: lawyerInfo.is_us_taxpayer,
                us_taxpayer_id: lawyerInfo.us_taxpayer_id,
                country_of_tax_residency: lawyerInfo.country_of_tax_residency,
                id_type: lawyerInfo.id_type,
                id_number: lawyerInfo.id_number,
                id_issue_date: lawyerInfo.id_issue_date,
                id_expiry_date: lawyerInfo.id_expiry_date,
                id_issuing_country: lawyerInfo.id_issuing_country,
              }}
              onEdit={() => setShowKycDialog(true)}
              showEditButton={canEdit}
              title="Personal KYC Information"
            />
          )}
          </ProfileOverviewShell>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {lawyerInfo ? (
            <MembersManagementTab
              entityType="lawyer"
              entityId={lawyerInfo.id}
              entityName={lawyerInfo.firm_name || lawyerInfo.display_name || 'Law Firm'}
              showSignatoryOption={true}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No law firm linked to your account
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Entity Members Tab (Directors/UBOs) */}
        {lawyerInfo?.type !== 'individual' && (
          <TabsContent value="entity-members" className="space-y-4">
            {lawyerInfo ? (
              <GenericEntityMembersTab
                entityType="lawyer"
                entityId={lawyerInfo.id}
                entityName={lawyerInfo.firm_name || lawyerInfo.display_name || 'Law Firm'}
                apiEndpoint="/api/lawyers/me/members"
                canManage={lawyerUserInfo.role === 'admin' || lawyerUserInfo.is_primary}
                title="Directors, UBOs & Signatories"
                description="Manage firm partners, directors, beneficial owners (>25% ownership), and authorized signatories with full KYC information."
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No law firm linked to your account
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* KYC Tab */}
        <TabsContent value="kyc" className="space-y-4">
          {lawyerInfo?.type !== 'individual' &&
            !['approved', 'submitted', 'pending_review'].includes(lawyerInfo?.kyc_status || '') && (
            <Card>
              <CardContent className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Submit Entity Info for Review</p>
                  <p className="text-sm text-muted-foreground">
                    Required to complete KYC and trigger account activation approval.
                  </p>
                </div>
                {(lawyerUserInfo.role === 'admin' || lawyerUserInfo.is_primary) ? (
                  <Button onClick={handleSubmitEntityKyc} disabled={isSubmittingEntityKyc} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmittingEntityKyc ? 'Submitting...' : 'Submit Entity Info'}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only primary contacts can submit entity information for review.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {lawyerInfo ? (
            <LawyerKYCDocumentsTab
              lawyerId={lawyerInfo.id}
              lawyerName={lawyerInfo.firm_name || lawyerInfo.display_name}
              kycStatus={lawyerInfo.kyc_status || undefined}
              entityType={lawyerInfo.type}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No law firm linked to your account
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>


        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <PasswordChangeForm />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <PreferencesEditor variant="investor" />
          <GDPRControls />
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-4">
          <NoticeContactsTab apiEndpoint="/api/lawyers/me/notice-contacts" />
        </TabsContent>
      </Tabs>

      {/* Address Edit Dialog */}
      {lawyerInfo && (
        <EntityAddressEditDialog
          open={showAddressDialog}
          onOpenChange={setShowAddressDialog}
          entityType="lawyer"
          entityName={lawyerInfo.firm_name || lawyerInfo.display_name}
          initialData={{
            address_line_1: lawyerInfo.address_line_1,
            address_line_2: lawyerInfo.address_line_2,
            city: lawyerInfo.city,
            state_province: lawyerInfo.state_province,
            postal_code: lawyerInfo.postal_code,
            country: lawyerInfo.country,
            email: lawyerInfo.email || lawyerInfo.primary_contact_email,
            phone: lawyerInfo.phone || lawyerInfo.primary_contact_phone,
            phone_mobile: lawyerInfo.phone_mobile,
            phone_office: lawyerInfo.phone_office,
            website: lawyerInfo.website,
          }}
          apiEndpoint="/api/lawyers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Individual KYC Edit Dialog (for individual lawyers) */}
      {lawyerInfo?.type === 'individual' && (
        <EntityKYCEditDialog
          open={showKycDialog}
          onOpenChange={setShowKycDialog}
          entityType="lawyer"
          entityId={lawyerInfo.id}
          entityName={lawyerInfo.firm_name || lawyerInfo.display_name}
          initialData={{
            first_name: lawyerInfo.first_name ?? undefined,
            middle_name: lawyerInfo.middle_name ?? undefined,
            last_name: lawyerInfo.last_name ?? undefined,
            name_suffix: lawyerInfo.name_suffix ?? undefined,
            date_of_birth: lawyerInfo.date_of_birth ?? undefined,
            nationality: lawyerInfo.nationality ?? undefined,
            country_of_birth: lawyerInfo.country_of_birth ?? undefined,
            phone_mobile: lawyerInfo.phone_mobile ?? undefined,
            phone_office: lawyerInfo.phone_office ?? undefined,
            is_us_citizen: lawyerInfo.is_us_citizen === true,
            is_us_taxpayer: lawyerInfo.is_us_taxpayer === true,
            us_taxpayer_id: lawyerInfo.us_taxpayer_id ?? undefined,
            country_of_tax_residency: lawyerInfo.country_of_tax_residency ?? undefined,
            id_type: lawyerInfo.id_type ?? undefined,
            id_number: lawyerInfo.id_number ?? undefined,
            id_issue_date: lawyerInfo.id_issue_date ?? undefined,
            id_expiry_date: lawyerInfo.id_expiry_date ?? undefined,
            id_issuing_country: lawyerInfo.id_issuing_country ?? undefined,
            residential_street: lawyerInfo.residential_street ?? undefined,
            residential_city: lawyerInfo.residential_city ?? undefined,
            residential_state: lawyerInfo.residential_state ?? undefined,
            residential_postal_code: lawyerInfo.residential_postal_code ?? undefined,
            residential_country: lawyerInfo.residential_country ?? undefined,
          }}
          apiEndpoint="/api/lawyers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
