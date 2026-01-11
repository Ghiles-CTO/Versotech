'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, Info, Building2, User, AlertCircle } from 'lucide-react'
import { getEntityDocumentTypes, getMemberDocumentTypes, getIndividualDocumentTypes } from '@/constants/kyc-document-types'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Member {
  id: string
  full_name: string
  role: string
}

interface KYCUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
  entityId?: string | null
  category?: 'individual' | 'entity' | 'both'
  members?: Member[]
  memberType?: 'investor' | 'counterparty'
}

export function KYCUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
  entityId = null,
  category = 'both',
  members = [],
  memberType
}: KYCUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('')
  const [customLabel, setCustomLabel] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [uploadTarget, setUploadTarget] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const isEntityInvestor = category === 'entity'
  const isForMember = uploadTarget && uploadTarget !== 'entity-level'
  const hasMembers = members.length > 0

  // Get document types based on selection
  const availableDocumentTypes = useMemo(() => {
    if (!isEntityInvestor) {
      // Individual investor - simple personal docs
      return getIndividualDocumentTypes()
    }

    if (isForMember) {
      // Uploading for a specific member - personal ID docs
      return getMemberDocumentTypes()
    }

    // Entity-level docs
    return getEntityDocumentTypes()
  }, [isEntityInvestor, isForMember])

  // Reset document type when target changes
  useEffect(() => {
    setDocumentType('')
  }, [uploadTarget])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null)
      setDocumentType('')
      setCustomLabel('')
      setExpiryDate('')
      setNotes('')
      setUploadTarget('')
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File too large', { description: 'Maximum file size is 10MB' })
        return
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type', { description: 'Only PDF and image files are allowed' })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (isEntityInvestor && !uploadTarget) {
      toast.error('Please select who this document is for')
      return
    }

    if (!documentType) {
      toast.error('Please select a document type')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType === 'custom' ? customLabel.toLowerCase().replace(/\s+/g, '_') : documentType)

      if (documentType === 'custom' && customLabel) {
        formData.append('customLabel', customLabel)
      }

      if (expiryDate) {
        formData.append('expiryDate', expiryDate)
      }

      if (notes) {
        formData.append('notes', notes)
      }

      if (entityId) {
        formData.append('entityId', entityId)
      }

      // Add member ID if uploading for a specific member
      if (isForMember && memberType) {
        if (memberType === 'investor') {
          formData.append('investorMemberId', uploadTarget)
        } else if (memberType === 'counterparty') {
          formData.append('counterpartyMemberId', uploadTarget)
        }
      }

      const response = await fetch('/api/investors/me/documents/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }

      toast.success('Document uploaded successfully')
      onOpenChange(false)
      onUploadSuccess()

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Upload failed', { description: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload KYC Document</DialogTitle>
          <DialogDescription>
            {isEntityInvestor
              ? 'Upload entity documents or member ID documents'
              : 'Upload your ID and proof of address'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: For entity investors - WHO is this document for? */}
          {isEntityInvestor && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Step 1: Who is this document for?
              </Label>
              <Select value={uploadTarget} onValueChange={setUploadTarget}>
                <SelectTrigger className={!uploadTarget ? 'border-amber-400 bg-amber-50' : ''}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Entity option - always available */}
                  <SelectItem value="entity-level">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Entity (Company Documents)</span>
                    </div>
                  </SelectItem>

                  {/* Member options - if members exist */}
                  {hasMembers && members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span>{member.full_name}</span>
                        <span className="text-muted-foreground text-xs">({member.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Helpful description */}
              {uploadTarget === 'entity-level' && (
                <p className="text-sm text-blue-600">
                  Entity docs: Incorporation Certificate, Memo & Articles, Registers, Bank Confirmation
                </p>
              )}
              {isForMember && (
                <p className="text-sm text-green-600">
                  Member docs: Passport/ID, Proof of Address
                </p>
              )}

              {/* Alert if no members */}
              {!hasMembers && (
                <Alert className="border-amber-300 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>No members added yet.</strong> To upload ID documents for Directors/UBOs,
                    first add them in the <span className="font-semibold">Directors/UBOs tab</span>.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* STEP 2: Document Type */}
          <div className="space-y-2">
            <Label className={isEntityInvestor ? "text-base font-semibold" : ""}>
              {isEntityInvestor ? 'Step 2: Document Type' : 'Document Type'}
            </Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
              disabled={isEntityInvestor && !uploadTarget}
            >
              <SelectTrigger className={isEntityInvestor && !uploadTarget ? 'opacity-50' : ''}>
                <SelectValue placeholder={isEntityInvestor && !uploadTarget ? 'First select who...' : 'Select document type...'} />
              </SelectTrigger>
              <SelectContent>
                {availableDocumentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
            {documentType && documentType !== 'custom' && (
              <p className="text-xs text-muted-foreground">
                {availableDocumentTypes.find(t => t.value === documentType)?.description}
              </p>
            )}
          </div>

          {/* Custom label if "Other" selected */}
          {documentType === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Document Name</Label>
              <Input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Trust Agreement"
                required
              />
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
              onChange={handleFileChange}
              required
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Max 10MB. PDF, JPEG, PNG, HEIC, WEBP accepted.
            </p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>Expiry Date (Optional)</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional info..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !file || !documentType || (isEntityInvestor && !uploadTarget) || (documentType === 'custom' && !customLabel.trim())}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
