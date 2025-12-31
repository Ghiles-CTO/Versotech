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
  Upload,
  Globe,
  Calendar,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

// Import profile components
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { PreferencesEditor } from '@/components/profile/preferences-editor'
import { GDPRControls } from '@/components/profile/gdpr-controls'

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
  userEmail: string
  profile: Profile | null
  introducerInfo: IntroducerInfo | null
  introducerUserInfo: IntroducerUserInfo
  activeAgreement: ActiveAgreement | null
  introductionCount: number
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

export function IntroducerProfileClient({
  userEmail,
  profile,
  introducerInfo,
  introducerUserInfo,
  activeAgreement,
  introductionCount,
}: IntroducerProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const formatCommission = (bps: number | null | undefined) => {
    if (bps === null || bps === undefined) return '-'
    return `${(bps / 100).toFixed(2)}%`
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
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
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="agreement" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Agreement
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Introducer Information
              </CardTitle>
              <CardDescription>
                Your introducer entity details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                Your personal account linked to this introducer
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
                  <p className="text-sm font-medium capitalize">{introducerUserInfo.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Can Sign Documents</p>
                  <p className="text-sm font-medium">
                    {introducerUserInfo.can_sign ? (
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
                    <a href="/versotech_main/introducer-agreements">View All Agreements</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  )
}
