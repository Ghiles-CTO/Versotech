'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
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
  FileSignature,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  Edit,
  Shield,
  Globe,
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IndividualKycDisplay, EntityKYCEditDialog, EntityAddressEditDialog, EntityInfoEditDialog } from '@/components/shared'

// Types for investor entity data passed from server
type InvestorInfo = {
  id: string
  legal_name: string
  display_name: string | null
  type: string | null
  status: string | null
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
}

// Status badge configurations
const STATUS_BADGES: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
}

const KYC_BADGES: Record<string, { label: string; className: string }> = {
  approved: { label: 'KYC Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  pending: { label: 'KYC Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  rejected: { label: 'KYC Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  not_started: { label: 'KYC Not Started', className: 'bg-gray-100 text-gray-800 border-gray-200' },
}

export function ProfilePageClient({
  userEmail,
  profile: initialProfile,
  variant = 'investor',
  defaultTab = 'overview',
  investorInfo,
  investorUserInfo
}: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [showEntityInfoDialog, setShowEntityInfoDialog] = useState(false)
  const isStaff = variant === 'staff'

  // Use server-passed investorInfo instead of client-side fetching
  const hasInvestorEntity = !!investorInfo
  const isIndividual = investorInfo?.type === 'individual'
  const isEntity = hasInvestorEntity && investorInfo?.type !== 'individual'

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
  const kycBadge = KYC_BADGES[investorInfo?.kyc_status || 'not_started'] || KYC_BADGES.not_started

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
    <div className="p-6 space-y-6">
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
              <TabsTrigger value="signature" className="flex items-center gap-2">
                <FileSignature className="h-4 w-4" />
                Signature
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
                <CardDescription>
                  Your account details within this investor entity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <div className="font-medium">
                    {profile.display_name || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile.email || userEmail}
                  </div>
                </div>
                {hasInvestorEntity && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {investorUserInfo?.role || 'member'}
                      </Badge>
                      {investorUserInfo?.is_primary && (
                        <Badge variant="secondary">Primary Contact</Badge>
                      )}
                      {investorUserInfo?.can_sign && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Signatory
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investor Entity Info - Only for ENTITY type, not individual */}
            {isEntity && investorInfo && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Entity Information
                    </CardTitle>
                    <CardDescription>
                      Organization details
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEntityInfoDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Display Name</Label>
                    <div className="font-medium">
                      {investorInfo.display_name || '-'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Legal Name</Label>
                    <div className="font-medium">{investorInfo.legal_name || '-'}</div>
                  </div>
                  {investorInfo.country_of_incorporation && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Country of Incorporation</Label>
                      <div className="font-medium">{investorInfo.country_of_incorporation}</div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="capitalize">
                      {(investorInfo.type || 'entity').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact & Address for ENTITY investors only (individual investors show this in IndividualKycDisplay) */}
          {isEntity && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investorInfo!.email && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {investorInfo!.email}
                      </div>
                    </div>
                  )}
                  {investorInfo!.phone && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Phone</Label>
                      <div className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {investorInfo!.phone}
                      </div>
                    </div>
                  )}
                  {investorInfo!.phone_mobile && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Mobile</Label>
                      <div className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {investorInfo!.phone_mobile}
                      </div>
                    </div>
                  )}
                  {investorInfo!.website && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Website</Label>
                      <div className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={investorInfo!.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {investorInfo!.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {!investorInfo!.email && !investorInfo!.phone && !investorInfo!.phone_mobile && !investorInfo!.website && (
                    <p className="text-muted-foreground text-sm">No contact information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {isEntity ? 'Registered Address' : 'Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEntity ? (
                    // Entity address display - use registered_* columns
                    investorInfo!.registered_address_line_1 ? (
                      <>
                        <div className="font-medium">
                          {investorInfo!.registered_address_line_1}
                        </div>
                        {investorInfo!.registered_address_line_2 && (
                          <div className="text-muted-foreground">{investorInfo!.registered_address_line_2}</div>
                        )}
                        {(investorInfo!.registered_city || investorInfo!.registered_state || investorInfo!.registered_postal_code || investorInfo!.registered_country) && (
                          <div className="text-muted-foreground">
                            {[
                              investorInfo!.registered_city,
                              investorInfo!.registered_state,
                              investorInfo!.registered_postal_code,
                              investorInfo!.registered_country
                            ].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">No address information available</p>
                    )
                  ) : (
                    // Individual address display - use residential_* columns
                    investorInfo!.residential_street ? (
                      <>
                        <div className="font-medium">
                          {investorInfo!.residential_street}
                        </div>
                        {investorInfo!.residential_line_2 && (
                          <div className="text-muted-foreground">{investorInfo!.residential_line_2}</div>
                        )}
                        {(investorInfo!.residential_city || investorInfo!.residential_state || investorInfo!.residential_postal_code || investorInfo!.residential_country) && (
                          <div className="text-muted-foreground">
                            {[
                              investorInfo!.residential_city,
                              investorInfo!.residential_state,
                              investorInfo!.residential_postal_code,
                              investorInfo!.residential_country
                            ].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">No address information available</p>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Individual KYC Info Display */}
          {isIndividual && investorInfo && (
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
                id_type: investorInfo.id_type,
                id_number: investorInfo.id_number,
                id_issue_date: investorInfo.id_issue_date,
                id_expiry_date: investorInfo.id_expiry_date,
                id_issuing_country: investorInfo.id_issuing_country,
              }}
              onEdit={() => setShowKycDialog(true)}
              title="Personal KYC Information"
            />
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

        {/* Signature Tab */}
        {hasInvestorEntity && (
          <TabsContent value="signature" className="space-y-6">
            {!investorUserInfo?.can_sign ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    Signature Specimen
                  </CardTitle>
                  <CardDescription>
                    You do not have signing permissions for this investor entity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Signing permissions are required to upload a signature specimen.
                      Contact your entity administrator for access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SignatureSpecimenTab
                entityType="investor"
                entityId={investorInfo?.id}
              />
            )}
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
            first_name: investorInfo.first_name ?? undefined,
            middle_name: investorInfo.middle_name ?? undefined,
            last_name: investorInfo.last_name ?? undefined,
            name_suffix: investorInfo.name_suffix ?? undefined,
            date_of_birth: investorInfo.date_of_birth ?? undefined,
            nationality: investorInfo.nationality ?? undefined,
            country_of_birth: investorInfo.country_of_birth ?? undefined,
            phone_mobile: investorInfo.phone_mobile ?? undefined,
            phone_office: investorInfo.phone_office ?? undefined,
            is_us_citizen: investorInfo.is_us_citizen === true,
            is_us_taxpayer: investorInfo.is_us_taxpayer === true,
            us_taxpayer_id: investorInfo.us_taxpayer_id ?? undefined,
            country_of_tax_residency: investorInfo.country_of_tax_residency ?? undefined,
            id_type: investorInfo.id_type ?? undefined,
            id_number: investorInfo.id_number ?? undefined,
            id_issue_date: investorInfo.id_issue_date ?? undefined,
            id_expiry_date: investorInfo.id_expiry_date ?? undefined,
            id_issuing_country: investorInfo.id_issuing_country ?? undefined,
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

      {/* Address/Contact Edit Dialog */}
      {hasInvestorEntity && investorInfo && (
        <EntityAddressEditDialog
          open={showAddressDialog}
          onOpenChange={setShowAddressDialog}
          entityType="investor"
          entityName={investorInfo.display_name || investorInfo.legal_name}
          initialData={isEntity ? {
            // Entity address mapping - use registered_* columns
            email: investorInfo.email ?? undefined,
            phone: investorInfo.phone ?? undefined,
            phone_mobile: investorInfo.phone_mobile ?? undefined,
            phone_office: investorInfo.phone_office ?? undefined,
            website: investorInfo.website ?? undefined,
            address_line_1: investorInfo.registered_address_line_1 ?? undefined,
            address_line_2: investorInfo.registered_address_line_2 ?? undefined,
            city: investorInfo.registered_city ?? undefined,
            state_province: investorInfo.registered_state ?? undefined,
            postal_code: investorInfo.registered_postal_code ?? undefined,
            country: investorInfo.registered_country ?? undefined,
          } : {
            // Individual address mapping - use residential_* columns
            email: investorInfo.email ?? undefined,
            phone: investorInfo.phone ?? undefined,
            phone_mobile: investorInfo.phone_mobile ?? undefined,
            phone_office: investorInfo.phone_office ?? undefined,
            website: investorInfo.website ?? undefined,
            address_line_1: investorInfo.residential_street ?? undefined,
            address_line_2: investorInfo.residential_line_2 ?? undefined,
            city: investorInfo.residential_city ?? undefined,
            state_province: investorInfo.residential_state ?? undefined,
            postal_code: investorInfo.residential_postal_code ?? undefined,
            country: investorInfo.residential_country ?? undefined,
          }}
          apiEndpoint="/api/investors/me"
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Entity Info Edit Dialog (display name, legal name) */}
      {isEntity && investorInfo && (
        <EntityInfoEditDialog
          open={showEntityInfoDialog}
          onOpenChange={setShowEntityInfoDialog}
          initialData={{
            display_name: investorInfo.display_name,
            legal_name: investorInfo.legal_name,
            country_of_incorporation: investorInfo.country_of_incorporation,
          }}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
