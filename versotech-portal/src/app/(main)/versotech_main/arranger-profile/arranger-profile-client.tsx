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
  MapPin,
  FileText,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  Edit,
  Loader2,
  Lock,
  Settings,
  Save,
  X,
  Camera,
  Upload,
  Users,
  Bell,
  Send,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

// Import profile components
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { GDPRControls } from '@/components/profile/gdpr-controls'
import { ArrangerKYCDocumentsTab } from '@/components/profile/arranger-kyc-documents-tab'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { GenericEntityMembersTab } from '@/components/profile/generic-entity-members-tab'
import { NoticeContactsTab } from '@/components/profile/notice-contacts-tab'
import { EntityKYCEditDialog, EntityAddressEditDialog, IndividualKycDisplay } from '@/components/shared'
import { PersonalKYCSection, MemberKYCData } from '@/components/profile/personal-kyc-section'

type ArrangerInfo = {
  id: string
  legal_name: string
  company_name: string | null
  registration_number: string | null
  tax_id: string | null
  regulator: string | null
  license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  email: string | null
  phone: string | null
  address: string | null
  kyc_status: string
  kyc_approved_at: string | null
  kyc_expires_at: string | null
  status: string
  is_active: boolean
  created_at: string | null
  logo_url?: string | null
  // Entity type (individual vs entity)
  type?: string | null
  // Phone numbers
  phone_mobile?: string | null
  phone_office?: string | null
  // Individual KYC fields (for individual arrangers)
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

type ArrangerUserInfo = {
  role: string
  is_primary: boolean
  is_active: boolean
  can_sign: boolean
  signature_specimen_url: string | null
  signature_specimen_uploaded_at: string | null
}

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface ArrangerProfileClientProps {
  userEmail: string
  profile: Profile | null
  arrangerInfo: ArrangerInfo | null
  arrangerUserInfo: ArrangerUserInfo
  dealCount: number
  memberInfo: MemberKYCData | null
}

const KYC_STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  not_started: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

// Editable field component
function EditableField({
  label,
  value,
  field,
  isEditing,
  editValue,
  onChange,
  type = 'text',
  multiline = false,
  icon: Icon,
  className,
}: {
  label: string
  value: string | null
  field: string
  isEditing: boolean
  editValue: string
  onChange: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel' | 'date'
  multiline?: boolean
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  if (isEditing) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={field} className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        {multiline ? (
          <Textarea
            id={field}
            value={editValue}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={3}
            className="mt-1"
          />
        ) : (
          <Input
            id={field}
            type={type}
            value={editValue}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="mt-1"
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className={cn(
          "text-foreground mt-1",
          type === 'date' || field.includes('number') || field.includes('id') ? 'font-mono' : '',
          multiline && 'whitespace-pre-line'
        )}>
          {value || <span className="text-muted-foreground italic">Not set</span>}
        </p>
      </div>
    </div>
  )
}

export function ArrangerProfileClient({
  userEmail,
  profile,
  arrangerInfo: initialArrangerInfo,
  arrangerUserInfo,
  dealCount,
  memberInfo,
}: ArrangerProfileClientProps) {
  const [arrangerInfo, setArrangerInfo] = useState(initialArrangerInfo)
  const [isEditingEntity, setIsEditingEntity] = useState(false)
  const [isEditingRegulatory, setIsEditingRegulatory] = useState(false)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [isSubmittingEntityKyc, setIsSubmittingEntityKyc] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Edit form data
  const [entityForm, setEntityForm] = useState({
    legal_name: arrangerInfo?.legal_name || '',
    registration_number: arrangerInfo?.registration_number || '',
    tax_id: arrangerInfo?.tax_id || '',
  })

  const [regulatoryForm, setRegulatoryForm] = useState({
    regulator: arrangerInfo?.regulator || '',
    license_number: arrangerInfo?.license_number || '',
    license_type: arrangerInfo?.license_type || '',
    license_expiry_date: arrangerInfo?.license_expiry_date || '',
  })

  const [contactForm, setContactForm] = useState({
    email: arrangerInfo?.email || '',
    phone: arrangerInfo?.phone || '',
    address: arrangerInfo?.address || '',
  })

  if (!arrangerInfo) {
    return (
      <div>
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Arranger Profile Not Found
          </h3>
          <p className="text-muted-foreground">
            Unable to load your arranger profile. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  const isLicenseExpiringSoon = () => {
    if (!arrangerInfo.license_expiry_date) return false
    const expiryDate = new Date(arrangerInfo.license_expiry_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
  }

  const isLicenseExpired = () => {
    if (!arrangerInfo.license_expiry_date) return false
    return new Date(arrangerInfo.license_expiry_date) < new Date()
  }

  const isKycExpiringSoon = () => {
    if (!arrangerInfo.kyc_expires_at) return false
    const expiryDate = new Date(arrangerInfo.kyc_expires_at)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
  }

  const handleSubmitEntityKyc = async () => {
    setIsSubmittingEntityKyc(true)
    try {
      const response = await fetch('/api/me/entity-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'arranger',
          entityId: arrangerInfo.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit entity KYC')
      }

      toast.success('Entity information submitted for review')
      window.location.reload()
    } catch (error) {
      console.error('[arranger-profile] Failed to submit entity KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit entity KYC')
    } finally {
      setIsSubmittingEntityKyc(false)
    }
  }

  // Save handlers
  const handleSaveEntity = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/arrangers/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setArrangerInfo(prev => prev ? { ...prev, ...entityForm } : null)
      setIsEditingEntity(false)
      toast.success('Entity details updated successfully')
    } catch (error: any) {
      console.error('Error saving entity:', error)
      toast.error(error.message || 'Failed to save entity details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveRegulatory = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/arrangers/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regulatoryForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setArrangerInfo(prev => prev ? { ...prev, ...regulatoryForm } : null)
      setIsEditingRegulatory(false)
      toast.success('Regulatory information updated successfully')
    } catch (error: any) {
      console.error('Error saving regulatory:', error)
      toast.error(error.message || 'Failed to save regulatory information')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveContact = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/arrangers/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setArrangerInfo(prev => prev ? { ...prev, ...contactForm } : null)
      setIsEditingContact(false)
      toast.success('Contact information updated successfully')
    } catch (error: any) {
      console.error('Error saving contact:', error)
      toast.error(error.message || 'Failed to save contact information')
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel handlers
  const handleCancelEntity = () => {
    setEntityForm({
      legal_name: arrangerInfo.legal_name || '',
      registration_number: arrangerInfo.registration_number || '',
      tax_id: arrangerInfo.tax_id || '',
    })
    setIsEditingEntity(false)
  }

  const handleCancelRegulatory = () => {
    setRegulatoryForm({
      regulator: arrangerInfo.regulator || '',
      license_number: arrangerInfo.license_number || '',
      license_type: arrangerInfo.license_type || '',
      license_expiry_date: arrangerInfo.license_expiry_date || '',
    })
    setIsEditingRegulatory(false)
  }

  const handleCancelContact = () => {
    setContactForm({
      email: arrangerInfo.email || '',
      phone: arrangerInfo.phone || '',
      address: arrangerInfo.address || '',
    })
    setIsEditingContact(false)
  }

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or WebP image')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/arrangers/me/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload logo')
      }

      const data = await response.json()
      setArrangerInfo(prev => prev ? { ...prev, logo_url: data.logo_url } : null)
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Logo Upload */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="relative h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer group overflow-hidden"
            onClick={() => logoInputRef.current?.click()}
          >
            {arrangerInfo.logo_url ? (
              <Image
                src={arrangerInfo.logo_url}
                alt={arrangerInfo.legal_name}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingLogo ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {arrangerInfo.legal_name}
            </h1>
            <p className="text-muted-foreground">
              {profile?.full_name || userEmail} - {arrangerUserInfo.role || 'Member'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={cn('capitalize', STATUS_STYLES[arrangerInfo.status] || STATUS_STYLES.inactive)}
          >
            {arrangerInfo.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn('capitalize', KYC_STATUS_STYLES[arrangerInfo.kyc_status] || KYC_STATUS_STYLES.not_started)}
          >
            KYC: {arrangerInfo.kyc_status?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {isLicenseExpiringSoon() && (
        <Card className="border-amber-500/30 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-foreground">License Expiring Soon</p>
                <p className="text-sm text-muted-foreground">
                  Your license expires on {formatDate(arrangerInfo.license_expiry_date!)}. Please renew before expiry.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLicenseExpired() && (
        <Card className="border-red-500/30 bg-red-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-foreground">License Expired</p>
                <p className="text-sm text-muted-foreground">
                  Your license expired on {formatDate(arrangerInfo.license_expiry_date!)}. Please contact VERSO to renew.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {arrangerInfo.kyc_status === 'pending' && (
        <Card className="border-blue-500/30 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-foreground">KYC Verification Pending</p>
                <p className="text-sm text-muted-foreground">
                  Your KYC documents are being reviewed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Mandates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Deals managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              KYC Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {arrangerInfo.kyc_status === 'approved' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : arrangerInfo.kyc_status === 'pending' ? (
                <Clock className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-lg font-semibold capitalize">
                {arrangerInfo.kyc_status?.replace('_', ' ')}
              </span>
            </div>
            {arrangerInfo.kyc_approved_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Approved {formatDate(arrangerInfo.kyc_approved_at)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              License
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {arrangerInfo.license_type || 'Not specified'}
            </div>
            {arrangerInfo.license_expiry_date && (
              <p className={cn(
                "text-xs mt-1",
                isLicenseExpired() ? "text-red-600 font-medium" :
                isLicenseExpiringSoon() ? "text-amber-600 font-medium" :
                "text-muted-foreground"
              )}>
                Expires {formatDate(arrangerInfo.license_expiry_date)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="details" className="space-y-4" id="arranger-profile-tabs">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 h-auto p-1 gap-1">
          <TabsTrigger value="details" className="flex items-center gap-2 text-xs sm:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entity</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="entity-members" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Directors/UBOs</span>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Regulatory</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 text-xs sm:text-sm">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="notices" className="flex items-center gap-2 text-xs sm:text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notices</span>
          </TabsTrigger>
        </TabsList>

        {/* Entity Details Tab - EDITABLE */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Entity Details</CardTitle>
                  <CardDescription>Legal and registration information</CardDescription>
                </div>
                {!isEditingEntity ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingEntity(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEntity} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEntity} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Legal Name"
                  value={arrangerInfo.legal_name}
                  field="legal_name"
                  isEditing={isEditingEntity}
                  editValue={entityForm.legal_name}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, legal_name: v }))}
                />
                <EditableField
                  label="Registration Number"
                  value={arrangerInfo.registration_number}
                  field="registration_number"
                  isEditing={isEditingEntity}
                  editValue={entityForm.registration_number}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, registration_number: v }))}
                />
                <EditableField
                  label="Tax ID"
                  value={arrangerInfo.tax_id}
                  field="tax_id"
                  isEditing={isEditingEntity}
                  editValue={entityForm.tax_id}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, tax_id: v }))}
                />
                {arrangerInfo.created_at && !isEditingEntity && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground mt-1">{formatDate(arrangerInfo.created_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal KYC Section - For the logged-in user's member record */}
          <PersonalKYCSection
            memberData={memberInfo}
            entityType="arranger"
            entityId={arrangerInfo.id}
            onRefresh={() => window.location.reload()}
          />

          {/* Individual KYC for Individual Arrangers */}
          {arrangerInfo.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: arrangerInfo.first_name,
                middle_name: arrangerInfo.middle_name,
                last_name: arrangerInfo.last_name,
                name_suffix: arrangerInfo.name_suffix,
                date_of_birth: arrangerInfo.date_of_birth,
                country_of_birth: arrangerInfo.country_of_birth,
                nationality: arrangerInfo.nationality,
                email: arrangerInfo.email,
                phone_mobile: arrangerInfo.phone_mobile,
                phone_office: arrangerInfo.phone_office,
                residential_street: arrangerInfo.residential_street,
                residential_line_2: arrangerInfo.residential_line_2,
                residential_city: arrangerInfo.residential_city,
                residential_state: arrangerInfo.residential_state,
                residential_postal_code: arrangerInfo.residential_postal_code,
                residential_country: arrangerInfo.residential_country,
                is_us_citizen: arrangerInfo.is_us_citizen,
                is_us_taxpayer: arrangerInfo.is_us_taxpayer,
                us_taxpayer_id: arrangerInfo.us_taxpayer_id,
                country_of_tax_residency: arrangerInfo.country_of_tax_residency,
                id_type: arrangerInfo.id_type,
                id_number: arrangerInfo.id_number,
                id_issue_date: arrangerInfo.id_issue_date,
                id_expiry_date: arrangerInfo.id_expiry_date,
                id_issuing_country: arrangerInfo.id_issuing_country,
              }}
              onEdit={() => setShowKycDialog(true)}
              title="Personal KYC Information"
              className="mt-6"
            />
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <MembersManagementTab
            entityType="arranger"
            entityId={arrangerInfo.id}
            entityName={arrangerInfo.legal_name}
            showSignatoryOption={true}
          />
        </TabsContent>

        {/* Entity Members Tab (Directors/UBOs) */}
        <TabsContent value="entity-members">
          <GenericEntityMembersTab
            entityType="arranger"
            entityId={arrangerInfo.id}
            entityName={arrangerInfo.legal_name}
            apiEndpoint="/api/arrangers/me/members"
            canManage={arrangerUserInfo.role === 'admin'}
            title="Directors, UBOs & Signatories"
            description="Manage directors, beneficial owners (>25% ownership), and authorized signatories with full KYC information."
          />
        </TabsContent>

        {/* Regulatory Tab - EDITABLE (except KYC) */}
        <TabsContent value="regulatory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Regulatory Information</CardTitle>
                  <CardDescription>Licensing and compliance details</CardDescription>
                </div>
                {!isEditingRegulatory ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingRegulatory(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelRegulatory} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveRegulatory} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Regulator"
                  value={arrangerInfo.regulator}
                  field="regulator"
                  isEditing={isEditingRegulatory}
                  editValue={regulatoryForm.regulator}
                  onChange={(_, v) => setRegulatoryForm(f => ({ ...f, regulator: v }))}
                />
                <EditableField
                  label="License Number"
                  value={arrangerInfo.license_number}
                  field="license_number"
                  isEditing={isEditingRegulatory}
                  editValue={regulatoryForm.license_number}
                  onChange={(_, v) => setRegulatoryForm(f => ({ ...f, license_number: v }))}
                />
                <EditableField
                  label="License Type"
                  value={arrangerInfo.license_type}
                  field="license_type"
                  isEditing={isEditingRegulatory}
                  editValue={regulatoryForm.license_type}
                  onChange={(_, v) => setRegulatoryForm(f => ({ ...f, license_type: v }))}
                />
                <EditableField
                  label="License Expiry"
                  value={arrangerInfo.license_expiry_date ? formatDate(arrangerInfo.license_expiry_date) : null}
                  field="license_expiry_date"
                  isEditing={isEditingRegulatory}
                  editValue={regulatoryForm.license_expiry_date}
                  onChange={(_, v) => setRegulatoryForm(f => ({ ...f, license_expiry_date: v }))}
                  type="date"
                />
              </div>

              {/* KYC Details - READ ONLY */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-foreground mb-3">KYC Verification (Read-only)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn('capitalize', KYC_STATUS_STYLES[arrangerInfo.kyc_status] || KYC_STATUS_STYLES.not_started)}
                      >
                        {arrangerInfo.kyc_status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {arrangerInfo.kyc_approved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved Date</label>
                      <p className="text-foreground mt-1">{formatDate(arrangerInfo.kyc_approved_at)}</p>
                    </div>
                  )}
                  {arrangerInfo.kyc_expires_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">KYC Expiry</label>
                      <p className={cn(
                        "mt-1",
                        isKycExpiringSoon() ? "text-amber-600 font-medium" : "text-foreground"
                      )}>
                        {formatDate(arrangerInfo.kyc_expires_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab - EDITABLE */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How to reach the arranger entity</CardDescription>
                </div>
                {!isEditingContact ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingContact(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelContact} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveContact} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Email"
                  value={arrangerInfo.email}
                  field="email"
                  isEditing={isEditingContact}
                  editValue={contactForm.email}
                  onChange={(_, v) => setContactForm(f => ({ ...f, email: v }))}
                  type="email"
                  icon={isEditingContact ? undefined : Mail}
                />
                <EditableField
                  label="Phone"
                  value={arrangerInfo.phone}
                  field="phone"
                  isEditing={isEditingContact}
                  editValue={contactForm.phone}
                  onChange={(_, v) => setContactForm(f => ({ ...f, phone: v }))}
                  type="tel"
                  icon={isEditingContact ? undefined : Phone}
                />
                <EditableField
                  label="Address"
                  value={arrangerInfo.address}
                  field="address"
                  isEditing={isEditingContact}
                  editValue={contactForm.address}
                  onChange={(_, v) => setContactForm(f => ({ ...f, address: v }))}
                  multiline
                  icon={isEditingContact ? undefined : MapPin}
                  className="md:col-span-2"
                />
              </div>

              {!arrangerInfo.email && !arrangerInfo.phone && !arrangerInfo.address && !isEditingContact && (
                <div className="text-center py-8 text-muted-foreground">
                  No contact information on file. Click Edit to add.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {arrangerInfo.type !== 'individual' &&
            !['approved', 'submitted', 'pending_review'].includes(arrangerInfo.kyc_status || '') && (
            <Card>
              <CardContent className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Submit Entity Info for Review</p>
                  <p className="text-sm text-muted-foreground">
                    Required to complete KYC and trigger account activation approval.
                  </p>
                </div>
                {(arrangerUserInfo.role === 'admin' || arrangerUserInfo.is_primary) ? (
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
          <ArrangerKYCDocumentsTab
            arrangerId={arrangerInfo.id}
            arrangerName={arrangerInfo.legal_name}
            kycStatus={arrangerInfo.kyc_status}
            entityType={arrangerInfo.type}
          />
        </TabsContent>


        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <PreferencesEditor variant="arranger" />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <GDPRControls variant="light" />
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices">
          <NoticeContactsTab apiEndpoint="/api/arrangers/me/notice-contacts" />
        </TabsContent>
      </Tabs>

      {/* Individual KYC Edit Dialog (for individual arrangers) */}
      {arrangerInfo.type === 'individual' && (
        <EntityKYCEditDialog
          open={showKycDialog}
          onOpenChange={setShowKycDialog}
          entityType="arranger"
          entityId={arrangerInfo.id}
          entityName={arrangerInfo.legal_name}
          initialData={{
            first_name: arrangerInfo.first_name ?? undefined,
            middle_name: arrangerInfo.middle_name ?? undefined,
            last_name: arrangerInfo.last_name ?? undefined,
            name_suffix: arrangerInfo.name_suffix ?? undefined,
            date_of_birth: arrangerInfo.date_of_birth ?? undefined,
            nationality: arrangerInfo.nationality ?? undefined,
            country_of_birth: arrangerInfo.country_of_birth ?? undefined,
            phone_mobile: arrangerInfo.phone_mobile ?? undefined,
            phone_office: arrangerInfo.phone_office ?? undefined,
            is_us_citizen: arrangerInfo.is_us_citizen === true,
            is_us_taxpayer: arrangerInfo.is_us_taxpayer === true,
            us_taxpayer_id: arrangerInfo.us_taxpayer_id ?? undefined,
            country_of_tax_residency: arrangerInfo.country_of_tax_residency ?? undefined,
            id_type: arrangerInfo.id_type ?? undefined,
            id_number: arrangerInfo.id_number ?? undefined,
            id_issue_date: arrangerInfo.id_issue_date ?? undefined,
            id_expiry_date: arrangerInfo.id_expiry_date ?? undefined,
            id_issuing_country: arrangerInfo.id_issuing_country ?? undefined,
            residential_street: arrangerInfo.residential_street ?? undefined,
            residential_city: arrangerInfo.residential_city ?? undefined,
            residential_state: arrangerInfo.residential_state ?? undefined,
            residential_postal_code: arrangerInfo.residential_postal_code ?? undefined,
            residential_country: arrangerInfo.residential_country ?? undefined,
          }}
          apiEndpoint="/api/arrangers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Entity Address Edit Dialog (for entity arrangers) */}
      {arrangerInfo.type !== 'individual' && (
        <EntityAddressEditDialog
          open={showAddressDialog}
          onOpenChange={setShowAddressDialog}
          entityType="arranger"
          entityName={arrangerInfo.legal_name}
          initialData={{
            address_line_1: arrangerInfo.address ?? '',
            email: arrangerInfo.email ?? '',
            phone: arrangerInfo.phone ?? '',
            phone_mobile: arrangerInfo.phone_mobile ?? '',
            phone_office: arrangerInfo.phone_office ?? '',
          }}
          apiEndpoint="/api/arrangers/me/profile"
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
