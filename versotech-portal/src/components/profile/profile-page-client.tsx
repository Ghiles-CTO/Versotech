'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { KYCDocumentsTab } from '@/components/profile/kyc-documents-tab'
import { CounterpartyEntitiesTab } from '@/components/profile/counterparty-entities-tab'
import { InvestorInfoForm } from '@/components/profile/investor-info-form'
import { ComplianceTab } from '@/components/profile/compliance-tab'
import { KYCQuestionnaire } from '@/components/kyc/KYCQuestionnaire'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  registered_address: string | null
  city: string | null
  representative_name: string | null
  representative_title: string | null
  is_professional_investor: boolean | null
  is_qualified_purchaser: boolean | null
  aml_risk_rating: string | null
  logo_url: string | null
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
  investorInfo,
  investorUserInfo
}: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const isStaff = variant === 'staff'
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'overview'

  // Use server-passed investorInfo instead of client-side fetching
  const hasInvestorEntity = !!investorInfo

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
            <div className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5 space-y-3">
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  Contact
                </p>
                <p className="text-sm mt-1 text-white">{profile.email}</p>
                {profile.phone && (
                  <p className="text-sm text-white/70">{profile.phone}</p>
                )}
              </div>

              {profile.office_location && (
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Office
                  </p>
                  <p className="text-sm mt-1 text-white">{profile.office_location}</p>
                </div>
              )}

              {profile.title && (
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Title
                  </p>
                  <p className="text-sm mt-1 text-white">{profile.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full" id={`profile-tabs-${profile.id}`}>
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              >
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
      <Tabs defaultValue={defaultTab} className="space-y-6" id={`profile-tabs-${profile.id}`}>
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
                Members
              </TabsTrigger>
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
            {/* Personal Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
                <CardDescription>
                  Your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <div className="font-medium">
                    {profile.full_name || profile.display_name || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile.email || userEmail}
                  </div>
                </div>
                {profile.phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {profile.phone}
                    </div>
                  </div>
                )}
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

            {/* Investor Entity Card */}
            {hasInvestorEntity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Investor Entity
                  </CardTitle>
                  <CardDescription>
                    Your investor organization details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Legal Name</Label>
                    <div className="font-medium">{investorInfo!.legal_name}</div>
                  </div>
                  {investorInfo!.display_name && investorInfo!.display_name !== investorInfo!.legal_name && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Display Name</Label>
                      <div className="font-medium">{investorInfo!.display_name}</div>
                    </div>
                  )}
                  {investorInfo!.type && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Type</Label>
                      <Badge variant="outline" className="capitalize">
                        {investorInfo!.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )}
                  {investorInfo!.country && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Country</Label>
                      <div className="font-medium">{investorInfo!.country}</div>
                    </div>
                  )}
                  {investorInfo!.email && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Entity Email</Label>
                      <div className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {investorInfo!.email}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* If no investor entity, show profile edit */}
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
          </div>
        </TabsContent>

        {/* KYC Tab */}
        {hasInvestorEntity && (
          <TabsContent value="kyc" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
              <p className="text-muted-foreground">Complete your profile to unlock full access.</p>
            </div>

            {/* KYC Documents */}
            <KYCDocumentsTab />

            {/* Contact Information */}
            <div className="pt-6 border-t">
              <InvestorInfoForm />
            </div>
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

        {/* Members Tab */}
        {hasInvestorEntity && (
          <TabsContent value="members" className="space-y-4">
            <MembersManagementTab
              entityType="investor"
              entityId={investorInfo!.id}
              entityName={investorInfo!.display_name || investorInfo!.legal_name}
              showSignatoryOption={true}
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
              <SignatureSpecimenTab />
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
    </div>
  )
}
