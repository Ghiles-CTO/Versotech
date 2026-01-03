'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Mail,
  Phone,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Loader2,
  Lock,
  Settings,
  Save,
  X,
  Camera,
  Globe,
  Calendar,
  FileSignature,
  AlertCircle,
  Shield,
  Scale,
  Users,
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
import { CommercialPartnerKYCDocumentsTab } from '@/components/profile/commercial-partner-kyc-documents-tab'
import { SignatureSpecimenTab } from '@/components/profile/signature-specimen-tab'

type CommercialPartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  type: string
  cp_type: string
  status: string
  regulatory_status: string | null
  regulatory_number: string | null
  jurisdiction: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  payment_terms: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  created_at: string | null
  logo_url: string | null
  kyc_status: string | null
}

type CommercialPartnerUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
  can_execute_for_clients: boolean
}

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface CommercialPartnerProfileClientProps {
  userEmail: string
  profile: Profile | null
  cpInfo: CommercialPartnerInfo | null
  cpUserInfo: CommercialPartnerUserInfo
  agreementCount: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
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
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'url'
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
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}

export function CommercialPartnerProfileClient({
  userEmail,
  profile,
  cpInfo,
  cpUserInfo,
  agreementCount,
}: CommercialPartnerProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit state
  const [editData, setEditData] = useState({
    contact_name: cpInfo?.contact_name || '',
    contact_email: cpInfo?.contact_email || '',
    contact_phone: cpInfo?.contact_phone || '',
    website: cpInfo?.website || '',
    notes: cpInfo?.notes || '',
  })

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/commercial-partners/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
      window.location.reload()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      contact_name: cpInfo?.contact_name || '',
      contact_email: cpInfo?.contact_email || '',
      contact_phone: cpInfo?.contact_phone || '',
      website: cpInfo?.website || '',
      notes: cpInfo?.notes || '',
    })
    setIsEditing(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/commercial-partners/me/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      toast.success('Logo updated successfully')
      window.location.reload()
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="h-20 w-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {cpInfo?.logo_url ? (
                <Image
                  src={cpInfo.logo_url}
                  alt={cpInfo.name || 'Logo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <Briefcase className="h-8 w-8 text-gray-400" />
              )}
            </div>
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
          </div>

          <div>
            <h1 className="text-2xl font-bold">{cpInfo?.name || 'Commercial Partner Profile'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                'text-xs',
                STATUS_STYLES[cpInfo?.status || 'inactive']
              )}>
                {cpInfo?.status || 'Unknown'}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {cpInfo?.cp_type?.replace(/_/g, ' ') || 'Partner'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {cpUserInfo.role} {cpUserInfo.is_primary && '(Primary)'}
              </span>
            </div>
          </div>
        </div>

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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Placement Agreements</p>
                <p className="text-2xl font-bold">{agreementCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regulatory Status</p>
                <p className="text-lg font-medium capitalize">
                  {cpInfo?.regulatory_status || 'Not Specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Status</p>
                <div className="flex items-center gap-2">
                  {cpInfo?.contract_end_date ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Until {formatDate(cpInfo.contract_end_date)}
                      </span>
                    </>
                  ) : cpInfo?.contract_start_date ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">No Contract</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4" id="commercial-partner-profile-tabs">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Regulatory
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
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
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Signature
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Commercial Partner Information
              </CardTitle>
              <CardDescription>
                Your commercial partner entity details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{cpInfo?.name || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Legal Name</p>
                  <p className="text-sm font-medium">{cpInfo?.legal_name || '-'}</p>
                </div>

                <EditableField
                  label="Contact Person"
                  value={cpInfo?.contact_name}
                  field="contact_name"
                  isEditing={isEditing}
                  editValue={editData.contact_name}
                  onEditChange={handleEditChange}
                />

                <EditableField
                  label="Contact Email"
                  value={cpInfo?.contact_email}
                  field="contact_email"
                  isEditing={isEditing}
                  editValue={editData.contact_email}
                  onEditChange={handleEditChange}
                  type="email"
                />

                <EditableField
                  label="Contact Phone"
                  value={cpInfo?.contact_phone}
                  field="contact_phone"
                  isEditing={isEditing}
                  editValue={editData.contact_phone}
                  onEditChange={handleEditChange}
                  type="tel"
                />

                <EditableField
                  label="Website"
                  value={cpInfo?.website}
                  field="website"
                  isEditing={isEditing}
                  editValue={editData.website}
                  onEditChange={handleEditChange}
                  type="url"
                />

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Partner Type</p>
                  <p className="text-sm font-medium capitalize">{cpInfo?.cp_type?.replace(/_/g, ' ') || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {cpInfo?.created_at ? formatDate(cpInfo.created_at) : '-'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <EditableField
                  label="Notes"
                  value={cpInfo?.notes}
                  field="notes"
                  isEditing={isEditing}
                  editValue={editData.notes}
                  onEditChange={handleEditChange}
                  type="textarea"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Account Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Your Account
              </CardTitle>
              <CardDescription>
                Your personal account linked to this commercial partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{profile?.full_name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{userEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium capitalize">{cpUserInfo.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Can Sign Documents</p>
                  <p className="text-sm font-medium">
                    {cpUserInfo.can_sign ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Can Execute for Clients</p>
                  <p className="text-sm font-medium">
                    {cpUserInfo.can_execute_for_clients ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulatory Tab */}
        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Regulatory Information
              </CardTitle>
              <CardDescription>
                Your regulatory status and licensing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Regulatory Status</p>
                  <p className="text-sm font-medium capitalize">{cpInfo?.regulatory_status || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Regulatory Number</p>
                  <p className="text-sm font-medium">{cpInfo?.regulatory_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Jurisdiction</p>
                  <p className="text-sm font-medium">{cpInfo?.jurisdiction || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Payment Terms</p>
                  <p className="text-sm font-medium">{cpInfo?.payment_terms || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Contract Start Date</p>
                  <p className="text-sm font-medium">
                    {cpInfo?.contract_start_date ? formatDate(cpInfo.contract_start_date) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Contract End Date</p>
                  <p className="text-sm font-medium">
                    {cpInfo?.contract_end_date ? formatDate(cpInfo.contract_end_date) : 'No expiry'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {cpInfo && (
            <MembersManagementTab
              entityType="commercial_partner"
              entityId={cpInfo.id}
              entityName={cpInfo.name || cpInfo.legal_name || 'Commercial Partner'}
              showSignatoryOption={true}
            />
          )}
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc" className="space-y-4">
          {cpInfo && (
            <CommercialPartnerKYCDocumentsTab
              commercialPartnerId={cpInfo.id}
              commercialPartnerName={cpInfo.name || cpInfo.legal_name || undefined}
              kycStatus={cpInfo.kyc_status || undefined}
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

        {/* Signature Tab */}
        <TabsContent value="signature" className="space-y-6">
          {!cpUserInfo.can_sign ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Signature Specimen
                </CardTitle>
                <CardDescription>
                  You do not have signing permissions for this commercial partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Signing permissions are required to upload a signature specimen.
                    Contact your commercial partner administrator for access.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SignatureSpecimenTab
              entityType="commercial_partner"
              entityId={cpInfo?.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
