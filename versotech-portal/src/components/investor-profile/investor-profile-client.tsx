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
  Shield,
  FileCheck,
  Briefcase,
  FileSignature,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { MembersManagementTab } from '@/components/members/members-management-tab'

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
  signature_specimen_url: string | null
  signature_specimen_uploaded_at: string | null
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
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    investorUserInfo.signature_specimen_url
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

      const response = await fetch('/api/investors/me/upload-signature', {
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
      const response = await fetch('/api/investors/me/upload-signature', {
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
    setSignaturePreview(investorUserInfo.signature_specimen_url)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Signature Specimen
              </CardTitle>
              <CardDescription>
                {investorUserInfo.can_sign
                  ? 'Upload your signature specimen for document signing'
                  : 'You do not have signing permissions for this investor entity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!investorUserInfo.can_sign ? (
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
                      {investorUserInfo.signature_specimen_uploaded_at && !signatureFile && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded on {formatDate(investorUserInfo.signature_specimen_uploaded_at)}
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
