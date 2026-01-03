'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  Briefcase,
  Target,
  FileSignature,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { MembersManagementTab } from '@/components/members/members-management-tab'
import { PartnerKYCDocumentsTab } from '@/components/profile/partner-kyc-documents-tab'

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
  city: string | null
  postal_code: string | null
  country: string | null
  preferred_sectors: string[] | null
  preferred_geographies: string[] | null
  kyc_status: string | null
  logo_url: string | null
}

type PartnerUserInfo = {
  role: string
  is_primary: boolean
  can_sign: boolean
  signature_specimen_url: string | null
  signature_specimen_uploaded_at: string | null
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
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    partnerUserInfo.signature_specimen_url
  )
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or WebP image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB')
      return
    }

    setSignatureFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setSignaturePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!signatureFile) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', signatureFile)

      const response = await fetch('/api/partners/me/upload-signature', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload signature')
      }

      setSignaturePreview(data.url)
      setSignatureFile(null)
      toast.success('Signature specimen uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch('/api/partners/me/upload-signature', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove signature')
      }

      setSignaturePreview(null)
      setSignatureFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Signature specimen removed')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove signature')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelSelection = () => {
    setSignatureFile(null)
    setSignaturePreview(partnerUserInfo.signature_specimen_url)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partnerInfo.contact_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contact Name</Label>
                    <div className="font-medium">{partnerInfo.contact_name}</div>
                  </div>
                )}
                {partnerInfo.contact_email && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contact Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {partnerInfo.contact_email}
                    </div>
                  </div>
                )}
                {partnerInfo.contact_phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contact Phone</Label>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {partnerInfo.contact_phone}
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
                {!partnerInfo.contact_name && !partnerInfo.contact_email && !partnerInfo.contact_phone && !partnerInfo.website && (
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
                    {(partnerInfo.city || partnerInfo.postal_code || partnerInfo.country) && (
                      <div className="text-muted-foreground">
                        {[partnerInfo.city, partnerInfo.postal_code, partnerInfo.country]
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Signature Specimen
              </CardTitle>
              <CardDescription>
                {partnerUserInfo.can_sign
                  ? 'Upload your signature specimen for document signing'
                  : 'You do not have signing permissions for this partner entity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!partnerUserInfo.can_sign ? (
                <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Signing permissions are required to upload a signature specimen.
                    Contact your entity administrator for access.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Signature Preview */}
                  {signaturePreview && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Current Signature</Label>
                      <div className="border rounded-lg p-4 bg-white">
                        <img
                          src={signaturePreview}
                          alt="Signature specimen"
                          className="max-h-32 mx-auto object-contain"
                        />
                      </div>
                      {partnerUserInfo.signature_specimen_uploaded_at && !signatureFile && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded on {formatDate(partnerUserInfo.signature_specimen_uploaded_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Upload Section */}
                  <div className="space-y-3">
                    <Label>
                      {signaturePreview ? 'Update Signature' : 'Upload Signature'}
                    </Label>

                    <div className="flex items-center gap-4">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleFileSelect}
                        className="flex-1"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PNG, JPEG, WebP. Maximum size: 5MB.
                      For best results, use a transparent PNG.
                    </p>

                    {signatureFile && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{signatureFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(signatureFile.size / 1024).toFixed(1)} KB - Ready to upload
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {signatureFile && (
                        <>
                          <Button onClick={handleUpload} disabled={uploading}>
                            {uploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Signature
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelSelection}
                            disabled={uploading}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {signaturePreview && !signatureFile && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={deleting}>
                              {deleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Remove Signature
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Signature Specimen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove your current signature specimen. You can upload a new one at any time.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
