'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Target,
  FileSignature,
  Shield,
  Edit,
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { PartnerKYCDocumentsTab } from '@/components/profile/partner-kyc-documents-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'
import { EntityKYCEditDialog, EntityAddressEditDialog } from '@/components/shared'
import { formatDate } from '@/lib/format'

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

type PartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  type: string
  partner_type: string
  status: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  preferred_sectors: string[] | null
  preferred_geographies: string[] | null
  kyc_status: string | null
  logo_url: string | null
  // Phone numbers
  phone: string | null
  phone_mobile: string | null
  phone_office: string | null
  email: string | null
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
  // Entity fields
  country_of_incorporation: string | null
  registration_number: string | null
  tax_id: string | null
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
}

type PartnerUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
}

interface PartnerProfileClientProps {
  userEmail: string
  profile: Profile | null
  partnerInfo: PartnerInfo
  partnerUserInfo: PartnerUserInfo
}

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

export function PartnerProfileClient({
  userEmail,
  profile,
  partnerInfo,
  partnerUserInfo
}: PartnerProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  const statusBadge = STATUS_BADGES[partnerInfo.status] || STATUS_BADGES.pending
  const StatusIcon = statusBadge.icon
  const kycBadge = KYC_BADGES[partnerInfo.kyc_status || 'not_started'] || KYC_BADGES.not_started

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your partner entity and team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusBadge.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusBadge.label}
          </Badge>
          <Badge className={kycBadge.className}>
            {kycBadge.label}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="partner-profile-tabs">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC Documents
          </TabsTrigger>
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Signature
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
                <CardDescription>
                  Your account details within this partner entity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <div className="font-medium">
                    {profile?.full_name || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile?.email || userEmail}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {partnerUserInfo.role}
                    </Badge>
                    {partnerUserInfo.is_primary && (
                      <Badge variant="secondary">Primary Contact</Badge>
                    )}
                    {partnerUserInfo.can_sign && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Signatory
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Partner Entity
                </CardTitle>
                <CardDescription>
                  Organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Name</Label>
                  <div className="font-medium">
                    {partnerInfo.name}
                  </div>
                </div>
                {partnerInfo.legal_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Legal Name</Label>
                    <div className="font-medium">
                      {partnerInfo.legal_name}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Partner Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {partnerInfo.partner_type.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {partnerInfo.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Address */}
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
                {partnerInfo.contact_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contact Name</Label>
                    <div className="font-medium">{partnerInfo.contact_name}</div>
                  </div>
                )}
                {(partnerInfo.email || partnerInfo.contact_email) && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {partnerInfo.email || partnerInfo.contact_email}
                    </div>
                  </div>
                )}
                {(partnerInfo.phone || partnerInfo.contact_phone) && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {partnerInfo.phone || partnerInfo.contact_phone}
                    </div>
                  </div>
                )}
                {partnerInfo.phone_mobile && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Mobile</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {partnerInfo.phone_mobile}
                    </div>
                  </div>
                )}
                {partnerInfo.website && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Website</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={partnerInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {partnerInfo.website}
                      </a>
                    </div>
                  </div>
                )}
                {!partnerInfo.contact_name && !partnerInfo.email && !partnerInfo.contact_email && !partnerInfo.phone && !partnerInfo.contact_phone && !partnerInfo.website && (
                  <p className="text-muted-foreground text-sm">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partnerInfo.address_line_1 ? (
                  <>
                    <div className="font-medium">
                      {partnerInfo.address_line_1}
                    </div>
                    {partnerInfo.address_line_2 && (
                      <div className="text-muted-foreground">{partnerInfo.address_line_2}</div>
                    )}
                    {(partnerInfo.city || partnerInfo.state_province || partnerInfo.postal_code || partnerInfo.country) && (
                      <div className="text-muted-foreground">
                        {[partnerInfo.city, partnerInfo.state_province, partnerInfo.postal_code, partnerInfo.country]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No address information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Personal KYC for Individual Partners */}
          {partnerInfo.type === 'individual' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Personal KYC Information
                  </CardTitle>
                  <CardDescription>
                    Your personal identification and tax details
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowKycDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Full Name</Label>
                    <div className="font-medium">
                      {[partnerInfo.first_name, partnerInfo.middle_name, partnerInfo.last_name, partnerInfo.name_suffix]
                        .filter(Boolean).join(' ') || 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <div className="font-medium">
                      {partnerInfo.date_of_birth ? formatDate(partnerInfo.date_of_birth) : 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Nationality</Label>
                    <div className="font-medium">{partnerInfo.nationality || 'Not set'}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">US Person</Label>
                    <div className="font-medium">
                      {partnerInfo.is_us_citizen || partnerInfo.is_us_taxpayer ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">ID Document</Label>
                    <div className="font-medium capitalize">
                      {partnerInfo.id_type?.replace('_', ' ') || 'Not set'}
                      {partnerInfo.id_number && ` (${partnerInfo.id_number})`}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">ID Expiry Date</Label>
                    <div className="font-medium">
                      {partnerInfo.id_expiry_date ? formatDate(partnerInfo.id_expiry_date) : 'Not set'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {(partnerInfo.preferred_sectors?.length || partnerInfo.preferred_geographies?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Investment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partnerInfo.preferred_sectors?.length ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Preferred Sectors</Label>
                    <div className="flex flex-wrap gap-2">
                      {partnerInfo.preferred_sectors.map((sector, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {partnerInfo.preferred_geographies?.length ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Preferred Geographies</Label>
                    <div className="flex flex-wrap gap-2">
                      {partnerInfo.preferred_geographies.map((geo, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {geo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <MembersManagementTab
            entityType="partner"
            entityId={partnerInfo.id}
            entityName={partnerInfo.name}
            showSignatoryOption={true}
          />
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <PartnerKYCDocumentsTab
            partnerId={partnerInfo.id}
            partnerName={partnerInfo.name}
            kycStatus={partnerInfo.kyc_status || undefined}
          />
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signature" className="space-y-6">
          {!partnerUserInfo.can_sign ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Signature Specimen
                </CardTitle>
                <CardDescription>
                  You do not have signing permissions for this partner entity
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
              entityType="partner"
              entityId={partnerInfo?.id}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* KYC Edit Dialogs */}
      {partnerInfo.type === 'individual' && (
        <EntityKYCEditDialog
          open={showKycDialog}
          onOpenChange={setShowKycDialog}
          entityType="partner"
          entityId={partnerInfo.id}
          entityName={partnerInfo.name}
          initialData={{
            first_name: partnerInfo.first_name,
            middle_name: partnerInfo.middle_name,
            last_name: partnerInfo.last_name,
            name_suffix: partnerInfo.name_suffix,
            date_of_birth: partnerInfo.date_of_birth,
            nationality: partnerInfo.nationality,
            country_of_birth: partnerInfo.country_of_birth,
            phone_mobile: partnerInfo.phone_mobile,
            phone_office: partnerInfo.phone_office,
            is_us_citizen: partnerInfo.is_us_citizen ?? false,
            is_us_taxpayer: partnerInfo.is_us_taxpayer ?? false,
            us_taxpayer_id: partnerInfo.us_taxpayer_id,
            country_of_tax_residency: partnerInfo.country_of_tax_residency,
            id_type: partnerInfo.id_type,
            id_number: partnerInfo.id_number,
            id_issue_date: partnerInfo.id_issue_date,
            id_expiry_date: partnerInfo.id_expiry_date,
            id_issuing_country: partnerInfo.id_issuing_country,
            residential_street: partnerInfo.residential_street,
            residential_city: partnerInfo.residential_city,
            residential_state: partnerInfo.residential_state,
            residential_postal_code: partnerInfo.residential_postal_code,
            residential_country: partnerInfo.residential_country,
          }}
          apiEndpoint="/api/partners/me"
          onSuccess={() => window.location.reload()}
        />
      )}

      <EntityAddressEditDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        entityType="partner"
        entityName={partnerInfo.name}
        initialData={{
          address_line_1: partnerInfo.address_line_1,
          address_line_2: partnerInfo.address_line_2,
          city: partnerInfo.city,
          state_province: partnerInfo.state_province,
          postal_code: partnerInfo.postal_code,
          country: partnerInfo.country,
          email: partnerInfo.email || partnerInfo.contact_email,
          phone: partnerInfo.phone || partnerInfo.contact_phone,
          phone_mobile: partnerInfo.phone_mobile,
          phone_office: partnerInfo.phone_office,
          website: partnerInfo.website,
        }}
        apiEndpoint="/api/partners/me"
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
