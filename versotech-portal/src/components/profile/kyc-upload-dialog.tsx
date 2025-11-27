'use client'

import { useState } from 'react'
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
import { Upload, Loader2, Info } from 'lucide-react'
import { getSuggestedDocumentTypes } from '@/constants/kyc-document-types'
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
  entityId?: string | null // Optional: for entity KYC upload
  category?: 'individual' | 'entity' | 'both' // Filter suggested types
  members?: Member[] // Optional: list of members to associate document with
  memberType?: 'investor' | 'counterparty' // Type of member (investor_member or counterparty_entity_member)
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
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const suggestedTypes = getSuggestedDocumentTypes(category)
  const isCustomType = documentType === 'custom'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Maximum file size is 10MB'
        })
        return
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type', {
          description: 'Only PDF and image files are allowed'
        })
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

    if (!documentType) {
      toast.error('Please select a document type')
      return
    }

    if (isCustomType && !customLabel.trim()) {
      toast.error('Please provide a custom label for your document')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', isCustomType ? customLabel.toLowerCase().replace(/\s+/g, '_') : documentType)

      if (isCustomType && customLabel) {
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

      // Add member ID based on member type
      if (selectedMemberId && memberType) {
        if (memberType === 'investor') {
          formData.append('investorMemberId', selectedMemberId)
        } else if (memberType === 'counterparty') {
          formData.append('counterpartyMemberId', selectedMemberId)
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

      toast.success('Document uploaded successfully', {
        description: 'Your KYC document is now pending review'
      })

      // Reset form
      setFile(null)
      setDocumentType('')
      setCustomLabel('')
      setExpiryDate('')
      setNotes('')
      setSelectedMemberId('')
      onOpenChange(false)
      onUploadSuccess()

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error.message
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setDocumentType('')
    setCustomLabel('')
    setExpiryDate('')
    setNotes('')
    setSelectedMemberId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload KYC Document</DialogTitle>
          <DialogDescription>
            {category === 'entity'
              ? 'Upload entity documents or member identification (ID/Passport, Utility Bill)'
              : 'Upload your identification documents (ID/Passport, Utility Bill)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom (Enter your own)</SelectItem>
                {suggestedTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {documentType && !isCustomType && (
              <p className="text-xs text-muted-foreground">
                {suggestedTypes.find(t => t.value === documentType)?.description}
              </p>
            )}
          </div>

          {/* Custom Label (if custom type selected) */}
          {isCustomType && (
            <div className="space-y-2">
              <Label htmlFor="custom-label">Custom Document Label</Label>
              <Input
                id="custom-label"
                type="text"
                placeholder="e.g., Trust Agreement, Operating Agreement"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                required={isCustomType}
              />
              <p className="text-xs text-muted-foreground">
                Enter a name for this document type
              </p>
            </div>
          )}

          {/* Member Selection (if members provided) */}
          {members.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="member-select">Member / Director</Label>
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member or director..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Entity-level document</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                For ID/Passport or Utility Bill, select the member. For entity documents, leave as &quot;Entity-level document&quot;.
              </p>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
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
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Max file size: 10MB. Accepted formats: PDF, JPEG, PNG, HEIC, WEBP
              </AlertDescription>
            </Alert>
          </div>

          {/* Expiry Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about this document..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !file || !documentType || (isCustomType && !customLabel.trim())}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
