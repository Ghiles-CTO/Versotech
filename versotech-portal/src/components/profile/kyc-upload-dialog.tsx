'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Loader2,
  Building2,
  User,
  AlertCircle,
  FileText,
  ShieldCheck,
  X,
  StickyNote,
  ChevronRight,
} from 'lucide-react'
import { getEntityDocumentTypes, getDocumentsByCategory, DOCUMENT_CATEGORIES } from '@/constants/kyc-document-types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

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
  const [documentCategory, setDocumentCategory] = useState<string>('')
  const [documentType, setDocumentType] = useState<string>('')
  const [customLabel, setCustomLabel] = useState<string>('')
  const [documentNumber, setDocumentNumber] = useState<string>('')
  const [documentIssueDate, setDocumentIssueDate] = useState<string>('')
  const [documentExpiryDate, setDocumentExpiryDate] = useState<string>('')
  const [documentIssuingCountry, setDocumentIssuingCountry] = useState<string>('')
  const [documentDate, setDocumentDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [uploadTarget, setUploadTarget] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEntityInvestor = category === 'entity'
  const isForMember = uploadTarget && uploadTarget !== 'entity-level'
  const hasMembers = members.length > 0

  // For individual/member: cascading — get doc types from selected category
  // For entity-level: flat dropdown of corporate docs
  const usesCascading = !isEntityInvestor || isForMember
  const categoryDocTypes = useMemo(() => {
    if (!usesCascading) return getEntityDocumentTypes()
    return getDocumentsByCategory(documentCategory)
  }, [usesCascading, documentCategory])

  // Reset document type + category when target changes
  useEffect(() => {
    setDocumentType('')
    setDocumentCategory('')
  }, [uploadTarget])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null)
      setDocumentCategory('')
      setDocumentType('')
      setCustomLabel('')
      setDocumentNumber('')
      setDocumentIssueDate('')
      setDocumentExpiryDate('')
      setDocumentIssuingCountry('')
      setDocumentDate('')
      setNotes('')
      setUploadTarget('')
    }
  }, [open])

  const selectedDocumentType = useMemo(() => {
    if (!documentType) return ''
    if (documentType === 'custom') {
      return customLabel.toLowerCase().trim().replace(/\s+/g, '_')
    }
    return documentType
  }, [documentType, customLabel])

  const requiresIdMetadata = useMemo(
    () => !!selectedDocumentType && isIdDocument(selectedDocumentType),
    [selectedDocumentType]
  )

  const requiresAddressDate = useMemo(
    () => !!selectedDocumentType && isProofOfAddress(selectedDocumentType),
    [selectedDocumentType]
  )

  // When category changes, reset document type (unless custom)
  const handleCategoryChange = useCallback((value: string) => {
    setDocumentCategory(value)
    if (value === 'custom') {
      setDocumentType('custom')
    } else {
      setDocumentType('')
    }
  }, [])

  const validateFile = useCallback((selectedFile: File): boolean => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB' })
      return false
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type', { description: 'Only PDF and image files are allowed' })
      return false
    }
    return true
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
    }
  }, [validateFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

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

    if (
      requiresIdMetadata &&
      (!documentNumber || !documentIssueDate || !documentExpiryDate || !documentIssuingCountry)
    ) {
      toast.error('Please complete all proof of ID details before uploading')
      return
    }

    if (requiresAddressDate && !documentDate) {
      toast.error('Please provide the proof of address document date')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const normalizedDocumentType = documentType === 'custom'
        ? customLabel.toLowerCase().trim().replace(/\s+/g, '_')
        : documentType
      formData.append('documentType', normalizedDocumentType)

      if (documentType === 'custom' && customLabel) {
        formData.append('customLabel', customLabel)
      }

      if (documentNumber) formData.append('documentNumber', documentNumber)
      if (documentIssueDate) formData.append('documentIssueDate', documentIssueDate)
      if (documentExpiryDate) formData.append('documentExpiryDate', documentExpiryDate)
      if (documentIssuingCountry) formData.append('documentIssuingCountry', documentIssuingCountry)
      if (documentDate) formData.append('documentDate', documentDate)

      if (notes) {
        formData.append('notes', notes)
      }

      if (entityId) {
        formData.append('entityId', entityId)
      }

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

  const fileExtension = file?.name.split('.').pop()?.toUpperCase() || ''
  const hasRequiredMetadata = (!requiresIdMetadata || (
    !!documentNumber &&
    !!documentIssueDate &&
    !!documentExpiryDate &&
    !!documentIssuingCountry
  )) && (!requiresAddressDate || !!documentDate)

  const canSubmit = file &&
    documentType &&
    (!isEntityInvestor || uploadTarget) &&
    (documentType !== 'custom' || customLabel.trim()) &&
    (!usesCascading || documentCategory) &&
    hasRequiredMetadata

  // Step tracking
  // Entity-level (flat): Who → Type → File (3 steps)
  // Entity member (cascading): Who → Category → Type → File (4 steps)
  // Individual (cascading): Category → Type → File (3 steps)
  const entityStep = (() => {
    if (!isEntityInvestor) {
      // Individual: Category → Type → File
      if (!documentCategory) return 1
      if (!documentType) return 2
      return 3
    }
    if (!uploadTarget) return 1
    if (isForMember) {
      // Member: Who → Category → Type → File
      if (!documentCategory) return 2
      if (!documentType) return 3
      return 4
    }
    // Entity-level: Who → Type → File
    if (!documentType) return 2
    return 3
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">Upload KYC Document</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {isEntityInvestor
                    ? 'Upload entity documents or member ID documents'
                    : 'Upload your Proof of Identification and Proof of Address'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">

          {/* Entity flow: Step 1 — Who is this for? */}
          {isEntityInvestor && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {entityStep === 1 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">1</span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">1</span>
                )}
                <Label className="text-sm font-medium">Who is this document for?</Label>
              </div>

              <Select value={uploadTarget} onValueChange={setUploadTarget}>
                <SelectTrigger className={!uploadTarget ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10' : ''}>
                  <SelectValue placeholder="Select recipient..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entity-level">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Entity (Company Documents)</span>
                    </div>
                  </SelectItem>
                  {hasMembers && members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-500" />
                        <span>{member.full_name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{member.role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {uploadTarget === 'entity-level' && (
                <p className="text-xs text-muted-foreground pl-7">
                  Incorporation Certificate, Memo & Articles, Registers, Bank Confirmation
                </p>
              )}
              {isForMember && (
                <p className="text-xs text-muted-foreground pl-7">
                  Passport/ID, Proof of Address for this member
                </p>
              )}

              {!hasMembers && (
                <Alert className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm">
                    <strong>No members added yet.</strong> Add Directors/UBOs first to upload their ID documents.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Cascading: Category → Type (for individual / member flows) */}
          {usesCascading && (
            <>
              {/* Category Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const stepNum = isEntityInvestor ? 2 : 1
                    const isActive = isEntityInvestor ? entityStep === 2 : entityStep === 1
                    const isDone = isEntityInvestor ? entityStep > 2 : entityStep > 1
                    return isDone ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{stepNum}</span>
                    ) : (
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{stepNum}</span>
                    )
                  })()}
                  <Label className="text-sm font-medium">Document Category</Label>
                </div>

                <Select
                  value={documentCategory}
                  onValueChange={handleCategoryChange}
                  disabled={isEntityInvestor && !uploadTarget}
                >
                  <SelectTrigger className={isEntityInvestor && !uploadTarget ? 'opacity-40 cursor-not-allowed' : ''}>
                    <SelectValue placeholder={isEntityInvestor && !uploadTarget ? 'Select recipient first...' : 'What type of document is this?'} />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {documentCategory && documentCategory !== 'custom' && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5 pl-7">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                    {DOCUMENT_CATEGORIES.find(c => c.value === documentCategory)?.description}
                  </p>
                )}
              </div>

              {/* Document Type (only when non-custom category selected) */}
              {documentCategory && documentCategory !== 'custom' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const stepNum = isEntityInvestor ? 3 : 2
                      const isActive = isEntityInvestor ? entityStep === 3 : entityStep === 2
                      const isDone = isEntityInvestor ? entityStep > 3 : entityStep > 2
                      return isDone ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{stepNum}</span>
                      ) : (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{stepNum}</span>
                      )
                    })()}
                    <Label className="text-sm font-medium">Document Type</Label>
                  </div>

                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specific document..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryDocTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span>{type.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {documentType && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5 pl-7">
                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                      {categoryDocTypes.find(t => t.value === documentType)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Custom label (when "Other" category) */}
              {documentCategory === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Document Name</Label>
                  <Input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g., Trust Agreement"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Entity-level: flat dropdown (unchanged) */}
          {!usesCascading && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {entityStep === 2 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">2</span>
                  ) : entityStep > 2 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">2</span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">2</span>
                  )}
                  <Label className="text-sm font-medium">Document Type</Label>
                </div>

                <Select
                  value={documentType}
                  onValueChange={setDocumentType}
                  disabled={!uploadTarget}
                >
                  <SelectTrigger className={!uploadTarget ? 'opacity-40 cursor-not-allowed' : ''}>
                    <SelectValue placeholder={!uploadTarget ? 'Select recipient first...' : 'Select document type...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryDocTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span>{type.label}</span>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <span>Other (Custom)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {documentType && documentType !== 'custom' && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                    {categoryDocTypes.find(t => t.value === documentType)?.description}
                  </p>
                )}
              </div>

              {documentType === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Document Name</Label>
                  <Input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g., Trust Agreement"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* File Drop Zone */}
          <div className="space-y-2">
            {(() => {
              // File step is always the last step
              const fileStepNum = (() => {
                if (!isEntityInvestor) return 3 // Individual: Cat → Type → File
                if (isForMember) return 4 // Member: Who → Cat → Type → File
                return 3 // Entity-level: Who → Type → File
              })()
              const isFileStepActive = entityStep === fileStepNum
              const isFileStepDone = entityStep > fileStepNum

              return (
                <div className="flex items-center gap-2 mb-1">
                  {isFileStepDone ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{fileStepNum}</span>
                  ) : (
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${isFileStepActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{fileStepNum}</span>
                  )}
                  <Label className="text-sm font-medium">Upload File</Label>
                </div>
              )
            })()}

            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
              onChange={handleFileChange}
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative cursor-pointer rounded-lg border-2 border-dashed p-6
                  transition-all duration-200 text-center
                  ${isDragging
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`rounded-full p-2.5 transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Upload className={`h-5 w-5 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? 'Drop file here' : 'Click to browse or drag & drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, JPEG, PNG, HEIC, WEBP &middot; Max 10MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fileExtension} &middot; {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Dynamic metadata fields */}
          {requiresIdMetadata && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Proof of ID details</p>
              <div className="space-y-2">
                <Label className="text-xs">Document Number</Label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Enter document number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Issue Date</Label>
                  <Input
                    type="date"
                    value={documentIssueDate}
                    onChange={(e) => setDocumentIssueDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expiry Date</Label>
                  <Input
                    type="date"
                    value={documentExpiryDate}
                    onChange={(e) => setDocumentExpiryDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Issuing Country</Label>
                <Input
                  value={documentIssuingCountry}
                  onChange={(e) => setDocumentIssuingCountry(e.target.value)}
                  placeholder="e.g. United Kingdom"
                />
              </div>
            </div>
          )}

          {requiresAddressDate && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Proof of address details</p>
              <div className="space-y-2">
                <Label className="text-xs">Document Date</Label>
                <Input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <StickyNote className="h-3 w-3" />
              Notes
              <span className="text-muted-foreground/50">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional info..."
              rows={1}
              className="text-sm min-h-[36px] resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/70 hidden sm:block">
            All documents are encrypted and stored securely.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isUploading || !canSubmit}
              onClick={handleSubmit}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
