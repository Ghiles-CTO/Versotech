'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Scale,
  User,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Loader2,
  FileSignature,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'

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
  signature_specimen_url: string | null
  signature_specimen_uploaded_at: string | null
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
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    lawyerUserInfo.signature_specimen_url
  )
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or WebP image')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB')
      return
    }

    setSignatureFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSignaturePreview(e.target?.result as string)
    }
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

      const response = await fetch('/api/lawyers/me/upload-signature', {
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
      const response = await fetch('/api/lawyers/me/upload-signature', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove signature')
      }

      setSignaturePreview(null)
      setSignatureFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    setSignaturePreview(lawyerUserInfo.signature_specimen_url)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lawyer Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and signature specimen
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your account details
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
            {lawyerInfo?.specializations?.length ? (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Specializations</Label>
                <div className="flex flex-wrap gap-2">
                  {lawyerInfo.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Signature Specimen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Signature Specimen
          </CardTitle>
          <CardDescription>
            {lawyerUserInfo.can_sign
              ? 'Upload your signature specimen for document signing'
              : 'You do not have signing permissions for this firm'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!lawyerUserInfo.can_sign ? (
            <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Signing permissions are required to upload a signature specimen.
                Contact your firm administrator for access.
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
                  {lawyerUserInfo.signature_specimen_uploaded_at && !signatureFile && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {formatDate(lawyerUserInfo.signature_specimen_uploaded_at)}
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
    </div>
  )
}
