'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Shield,
  FileCheck,
  Briefcase,
  FileSignature,
  FileText,
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { KYCDocumentsTab } from '@/components/profile/kyc-documents-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

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

interface InvestorProfileClientProps {
  userEmail: string
  profile: Profile | null
  investorInfo: InvestorInfo
  investorUserInfo: InvestorUserInfo
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
  in_review: { label: 'KYC In Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  rejected: { label: 'KYC Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  not_started: { label: 'KYC Not Started', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  expired: { label: 'KYC Expired', className: 'bg-orange-100 text-orange-800 border-orange-200' },
}

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  corporate: 'Corporate',
  trust: 'Trust',
  fund: 'Fund',
  family_office: 'Family Office',
  foundation: 'Foundation',
}

export function InvestorProfileClient({
  userEmail,
  profile,
  investorInfo,
  investorUserInfo
}: InvestorProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const statusBadge = STATUS_BADGES[investorInfo.status || 'pending'] || STATUS_BADGES.pending
  const StatusIcon = statusBadge.icon
  const kycBadge = KYC_BADGES[investorInfo.kyc_status || 'not_started'] || KYC_BADGES.not_started

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investor Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your investor entity and authorized representatives
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="investor-profile-tabs">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            KYC Documents
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
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
                  Your account details within this investor entity
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
                      {investorUserInfo.role}
                    </Badge>
                    {investorUserInfo.is_primary && (
                      <Badge variant="secondary">Primary Contact</Badge>
                    )}
                    {investorUserInfo.can_sign && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Authorized Signatory
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Entity Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Investor Entity
                </CardTitle>
                <CardDescription>
                  Organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Legal Name</Label>
                  <div className="font-medium">
                    {investorInfo.legal_name}
                  </div>
                </div>
                {investorInfo.display_name && investorInfo.display_name !== investorInfo.legal_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Display Name</Label>
                    <div className="font-medium">
                      {investorInfo.display_name}
                    </div>
                  </div>
                )}
                {investorInfo.type && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Entity Type</Label>
                    <Badge variant="outline" className="capitalize">
                      {INVESTOR_TYPE_LABELS[investorInfo.type] || investorInfo.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                )}
                {investorInfo.representative_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Representative</Label>
                    <div className="font-medium">
                      {investorInfo.representative_name}
                      {investorInfo.representative_title && (
                        <span className="text-muted-foreground ml-2">
                          ({investorInfo.representative_title})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorInfo.email && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {investorInfo.email}
                    </div>
                  </div>
                )}
                {investorInfo.phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {investorInfo.phone}
                    </div>
                  </div>
                )}
                {!investorInfo.email && !investorInfo.phone && (
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
                {investorInfo.registered_address ? (
                  <>
                    <div className="font-medium">
                      {investorInfo.registered_address}
                    </div>
                    {(investorInfo.city || investorInfo.country) && (
                      <div className="text-muted-foreground">
                        {[investorInfo.city, investorInfo.country]
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
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  KYC Status
                </CardTitle>
                <CardDescription>
                  Know Your Customer verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={kycBadge.className}>
                    {kycBadge.label}
                  </Badge>
                </div>
                {investorInfo.onboarding_status && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Onboarding Status</Label>
                    <Badge variant="outline" className="capitalize">
                      {investorInfo.onboarding_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jurisdictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Jurisdictions
                </CardTitle>
                <CardDescription>
                  Tax and incorporation details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorInfo.country_of_incorporation && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Country of Incorporation</Label>
                    <div className="font-medium">{investorInfo.country_of_incorporation}</div>
                  </div>
                )}
                {investorInfo.tax_residency && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Tax Residency</Label>
                    <div className="font-medium">{investorInfo.tax_residency}</div>
                  </div>
                )}
                {!investorInfo.country_of_incorporation && !investorInfo.tax_residency && (
                  <p className="text-muted-foreground text-sm">No jurisdiction information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Qualifications & Risk */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investor Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Investor Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {investorInfo.is_professional_investor && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Professional Investor
                    </Badge>
                  )}
                  {investorInfo.is_qualified_purchaser && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      Qualified Purchaser
                    </Badge>
                  )}
                  {!investorInfo.is_professional_investor && !investorInfo.is_qualified_purchaser && (
                    <p className="text-muted-foreground text-sm">No special qualifications</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AML Risk Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  AML Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorInfo.aml_risk_rating ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Risk Rating</Label>
                    <Badge
                      variant="outline"
                      className={
                        investorInfo.aml_risk_rating === 'low' ? 'border-green-500 text-green-700' :
                        investorInfo.aml_risk_rating === 'medium' ? 'border-amber-500 text-amber-700' :
                        investorInfo.aml_risk_rating === 'high' ? 'border-red-500 text-red-700' :
                        ''
                      }
                    >
                      {investorInfo.aml_risk_rating.toUpperCase()}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Risk assessment pending</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <KYCDocumentsTab />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <MembersManagementTab
            entityType="investor"
            entityId={investorInfo.id}
            entityName={investorInfo.display_name || investorInfo.legal_name}
            showSignatoryOption={true}
          />
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signature" className="space-y-6">
          {!investorUserInfo.can_sign ? (
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
      </Tabs>
    </div>
  )
}
