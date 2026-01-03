'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Scale,
  User,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  Users,
  Briefcase,
  Shield,
  Lock,
  Settings,
} from 'lucide-react'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'
import { LawyerKYCDocumentsTab } from '@/components/profile/lawyer-kyc-documents-tab'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'

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
}

export function LawyerProfileClient({
  userEmail,
  profile,
  lawyerInfo,
  lawyerUserInfo
}: LawyerProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lawyer Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, team members, and signature specimen
          </p>
        </div>
        {lawyerInfo?.is_active ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
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
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC Documents
          </TabsTrigger>
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Signature
          </TabsTrigger>
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
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your account details within this law firm
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
                      {lawyerUserInfo.role}
                    </Badge>
                    {lawyerUserInfo.is_primary && (
                      <Badge variant="secondary">Primary Contact</Badge>
                    )}
                    {lawyerUserInfo.can_sign && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Signatory
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Firm Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Firm Information
                </CardTitle>
                <CardDescription>
                  Your law firm details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Firm Name</Label>
                  <div className="font-medium">
                    {lawyerInfo?.firm_name || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Display Name</Label>
                  <div className="font-medium">
                    {lawyerInfo?.display_name || 'Not set'}
                  </div>
                </div>
                {lawyerInfo?.phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {lawyerInfo.phone}
                    </div>
                  </div>
                )}
                {lawyerInfo?.email && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Firm Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {lawyerInfo.email}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-4">
          {lawyerInfo ? (
            <LawyerKYCDocumentsTab
              lawyerId={lawyerInfo.id}
              lawyerName={lawyerInfo.firm_name || lawyerInfo.display_name || undefined}
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

        {/* Signature Tab */}
        <TabsContent value="signature" className="space-y-6">
          {!lawyerUserInfo.can_sign ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Signature Specimen
                </CardTitle>
                <CardDescription>
                  You do not have signing permissions for this firm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Signing permissions are required to upload a signature specimen.
                    Contact your firm administrator for access.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SignatureSpecimenTab
              entityType="lawyer"
              entityId={lawyerInfo?.id}
            />
          )}
        </TabsContent>

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
