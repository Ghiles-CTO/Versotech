'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Upload, Download, Trash2, CheckCircle2, Circle, Loader2, AlertCircle, Clock, AlertTriangle, Calendar, Eye } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { differenceInDays } from 'date-fns'
import {
  getValidationStatusColor,
  getValidationStatusLabel,
  formatExpiryCountdown,
  isIdDocument,
  isProofOfAddress,
  type ValidationStatus,
} from '@/lib/validation/document-validation'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { isPreviewableExtension } from '@/constants/document-preview.constants'

export type EntityType = 'investor' | 'introducer' | 'arranger' | 'lawyer' | 'partner' | 'commercial_partner'

interface RequiredDocument {
  label: string
  value: string
}

interface Member {
  id: string
  full_name?: string
  first_name?: string
  last_name?: string
  role: string
}

interface Document {
  id: string
  name: string
  type: string
  file_name: string
  file_key: string
  created_at: string
  file_size_bytes?: number
  document_date?: string | null
  document_expiry_date?: string | null
  validation_status?: ValidationStatus | null
  investor_member_id?: string | null
  arranger_member_id?: string | null
  partner_member_id?: string | null
  introducer_member_id?: string | null
  lawyer_member_id?: string | null
  commercial_partner_member_id?: string | null
  created_by?: {
    display_name?: string
    email?: string
  }
}

// Required documents by entity type — aligned with REQUIRED_ENTITY_DOCUMENTS
// in check-entity-kyc-status.ts (the approval engine source of truth).
// Labels match persona-specific self-service upload tabs.
const REQUIRED_DOCUMENTS: Record<EntityType, RequiredDocument[]> = {
  investor: [
    { label: 'Certificate of Incorporation', value: 'incorporation_certificate' },
    { label: 'Memorandum & Articles of Association', value: 'memo_articles' },
    { label: 'Register of Members', value: 'register_members' },
    { label: 'Register of Beneficial Owners', value: 'register_beneficial_owners' },
    { label: 'Register of Directors', value: 'register_directors' },
    { label: 'Bank Confirmation Letter', value: 'bank_confirmation' },
  ],
  introducer: [
    { label: 'Government-issued ID', value: 'government_id' },
    { label: 'Proof of Address', value: 'proof_of_address' },
    { label: 'Professional Qualifications', value: 'professional_qualifications' },
    { label: 'Bank Account Details', value: 'bank_account_details' },
    { label: 'Tax Registration Document', value: 'tax_registration' },
  ],
  arranger: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'FCA Authorization Letter / SEC Form ADV', value: 'regulatory_license' },
    { label: 'Professional Indemnity Insurance', value: 'insurance_certificate' },
    { label: 'AML/CTF Policy Document', value: 'aml_policy' },
    { label: 'Latest Financial Statements', value: 'financial_statements' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
    { label: 'Proof of Registered Address', value: 'proof_of_address' },
  ],
  lawyer: [
    { label: 'Certificate of Incorporation / Registration', value: 'certificate_of_incorporation' },
    { label: 'Proof of Registered Address', value: 'proof_of_address' },
    { label: 'Professional License / Bar Registration', value: 'professional_license' },
    { label: 'Professional Indemnity Insurance', value: 'professional_insurance' },
    { label: 'Partners/Directors List', value: 'directors_list' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
  ],
  partner: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'Company Registration Document', value: 'company_registration' },
    { label: 'Proof of Registered Address', value: 'proof_of_address' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
    { label: 'Directors/Partners List', value: 'directors_list' },
    { label: 'Partnership Agreement', value: 'partnership_agreement' },
  ],
  commercial_partner: [
    { label: 'Certificate of Incorporation', value: 'certificate_of_incorporation' },
    { label: 'Company Registration Document', value: 'company_registration' },
    { label: 'Proof of Registered Address', value: 'proof_of_address' },
    { label: 'Beneficial Ownership Declaration', value: 'beneficial_ownership' },
    { label: 'Directors List', value: 'directors_list' },
    { label: 'Bank Account Details', value: 'bank_account_details' },
  ],
}

// Member-specific required documents
const MEMBER_REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { label: 'ID Document (Passport/National ID)', value: 'member_id' },
  { label: 'Proof of Address', value: 'member_proof_of_address' },
]

interface KYCDocumentsTabProps {
  entityType: EntityType
  entityId: string
  entityName?: string
  readOnly?: boolean
  /** Optional: Filter documents to a specific member */
  memberId?: string
  /** Optional: Member name for display */
  memberName?: string
  /** Optional: List of members for member selector during upload */
  members?: Member[]
  /** Optional: Show member documents section */
  showMemberDocuments?: boolean
}

export function KYCDocumentsTab({
  entityType,
  entityId,
  entityName,
  readOnly = false,
  memberId,
  memberName,
  members = [],
  showMemberDocuments = false,
}: KYCDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Upload dialog state for date fields and member selection
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadDocType, setUploadDocType] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [documentDate, setDocumentDate] = useState<string>('')
  const [documentExpiryDate, setDocumentExpiryDate] = useState<string>('')
  const [staffOverride, setStaffOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [validationError, setValidationError] = useState<{ error: string; canOverride: boolean } | null>(null)

  const viewer = useDocumentViewer()

  const requiredDocuments = REQUIRED_DOCUMENTS[entityType] || []

  const fetchDocuments = useCallback(async () => {
    if (!entityId) return

    setLoading(true)
    try {
      // Build the query parameter based on entity type
      // Map entity types to their correct API parameter names
      const paramMapping: Record<string, string> = {
        investor: 'owner_investor_id',
        arranger: 'arranger_entity_id',
        introducer: 'introducer_id',
        lawyer: 'lawyer_id',
        partner: 'partner_id',
        commercial_partner: 'commercial_partner_id',
      }
      const paramName = paramMapping[entityType] || `${entityType}_id`
      const response = await fetch(`/api/documents?${paramName}=${entityId}&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Open upload dialog for documents that need validation
  const openUploadDialog = (file: File, documentType: string) => {
    setUploadFile(file)
    setUploadDocType(documentType)
    setDocumentDate('')
    setDocumentExpiryDate('')
    setStaffOverride(false)
    setOverrideReason('')
    setValidationError(null)
    setSelectedMemberId(memberId || '')
    setUploadDialogOpen(true)
  }

  // Perform the actual upload
  const handleUpload = async (file: File, documentType: string) => {
    if (!entityId) return

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT files')
      return
    }

    // For ID documents or proof of address, open the dialog to collect dates
    if (isIdDocument(documentType) || isProofOfAddress(documentType)) {
      openUploadDialog(file, documentType)
      return
    }

    // For other documents, upload directly
    await performUpload(file, documentType, '', '', '', false, '')
  }

  // Perform the upload with all fields
  const performUpload = async (
    file: File,
    documentType: string,
    docDate: string,
    expiryDate: string,
    targetMemberId: string,
    override: boolean,
    reason: string
  ) => {
    setUploading(documentType)
    setValidationError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')) // Remove extension

      // Set the entity relationship based on type
      const paramName = entityType === 'arranger' ? 'arranger_entity_id' : `${entityType}_id`
      formData.append(paramName, entityId)

      // Add member ID if provided (Phase 4)
      if (targetMemberId) {
        const memberParamName = `${entityType}_member_id`
        formData.append(memberParamName, targetMemberId)
      }

      // Add validation fields (Phase 5)
      if (docDate) {
        formData.append('document_date', docDate)
      }
      if (expiryDate) {
        formData.append('document_expiry_date', expiryDate)
      }
      if (override) {
        formData.append('staff_override', 'true')
        formData.append('override_reason', reason)
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a validation error that can be overridden
        if (response.status === 422 && data.validation?.canOverride) {
          setValidationError({
            error: data.error,
            canOverride: true
          })
          return
        }
        throw new Error(data.error || 'Upload failed')
      }

      const docTypeLabel = requiredDocuments.find(d => d.value === documentType)?.label ||
        MEMBER_REQUIRED_DOCUMENTS.find(d => d.value === documentType)?.label ||
        documentType
      toast.success(`${docTypeLabel} uploaded successfully`)

      // Close dialog and refresh
      setUploadDialogOpen(false)
      await fetchDocuments()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(null)
      // Reset file input
      if (fileInputRefs.current[documentType]) {
        fileInputRefs.current[documentType]!.value = ''
      }
    }
  }

  // Handle dialog submit
  const handleDialogSubmit = () => {
    if (!uploadFile || !uploadDocType) return
    performUpload(
      uploadFile,
      uploadDocType,
      documentDate,
      documentExpiryDate,
      selectedMemberId,
      staffOverride,
      overrideReason
    )
  }

  const handleDelete = async (document: Document) => {
    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/staff/documents/${document.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      toast.success('Document deleted successfully')

      // Refresh document list
      await fetchDocuments()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete document')
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name || doc.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const uploadedCount = documents.filter(d => requiredDocuments.some(req => req.value === d.type)).length
  const completionPercentage = requiredDocuments.length > 0
    ? Math.round((uploadedCount / requiredDocuments.length) * 100)
    : 0

  // Helper to render expiry/validation badge
  const renderValidationBadge = (doc: Document) => {
    // Check expiry date
    if (doc.document_expiry_date) {
      const expiryDate = new Date(doc.document_expiry_date)
      const today = new Date()
      const daysUntilExpiry = differenceInDays(expiryDate, today)

      if (daysUntilExpiry < 0) {
        return (
          <Badge className="bg-red-500/20 text-red-400 text-xs gap-1">
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        )
      } else if (daysUntilExpiry <= 30) {
        return (
          <Badge className="bg-amber-500/20 text-amber-400 text-xs gap-1">
            <Clock className="h-3 w-3" />
            {formatExpiryCountdown(daysUntilExpiry)}
          </Badge>
        )
      }
    }

    // Check validation status
    if (doc.validation_status && doc.validation_status !== 'valid') {
      return (
        <Badge className={`${getValidationStatusColor(doc.validation_status)} text-xs`}>
          {getValidationStatusLabel(doc.validation_status)}
        </Badge>
      )
    }

    return null
  }

  // Get member name for display
  const getMemberName = (member: Member) => {
    if (member.full_name) return member.full_name
    if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`
    return member.id.slice(0, 8)
  }

  return (
    <>
    {/* Upload Dialog with Date Fields */}
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            {isIdDocument(uploadDocType || '') && 'ID documents require an expiry date for compliance tracking.'}
            {isProofOfAddress(uploadDocType || '') && 'Proof of address must be dated within the last 3 months.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File info */}
          {uploadFile && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
              </div>
            </div>
          )}

          {/* Member selector (if members available) */}
          {members.length > 0 && (
            <div className="space-y-2">
              <Label>Associate with Member (Optional)</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Entity-level document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Entity-level document</SelectItem>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {getMemberName(member)} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Document date for proof of address */}
          {isProofOfAddress(uploadDocType || '') && (
            <div className="space-y-2">
              <Label htmlFor="document_date">
                Document Date <span className="text-red-400">*</span>
              </Label>
              <Input
                id="document_date"
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Date shown on the document (utility bill date, bank statement date, etc.)
              </p>
            </div>
          )}

          {/* Expiry date for ID documents */}
          {isIdDocument(uploadDocType || '') && (
            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                Document Expiry Date <span className="text-red-400">*</span>
              </Label>
              <Input
                id="expiry_date"
                type="date"
                value={documentExpiryDate}
                onChange={(e) => setDocumentExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Expiry date shown on the ID document
              </p>
            </div>
          )}

          {/* Validation error with override option */}
          {validationError && (
            <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{validationError.error}</p>
              </div>

              {validationError.canOverride && (
                <div className="space-y-2 pt-2 border-t border-red-500/30">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="staff_override"
                      checked={staffOverride}
                      onChange={(e) => setStaffOverride(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="staff_override" className="text-sm">
                      Staff Override (requires reason)
                    </Label>
                  </div>
                  {staffOverride && (
                    <Textarea
                      placeholder="Enter reason for override..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="min-h-[60px]"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDialogSubmit}
            disabled={
              uploading === uploadDocType ||
              (isIdDocument(uploadDocType || '') && !documentExpiryDate) ||
              (isProofOfAddress(uploadDocType || '') && !documentDate) ||
              (validationError?.canOverride && staffOverride && !overrideReason)
            }
          >
            {uploading === uploadDocType ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div className="space-y-5">
      {/* Summary Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">KYC Documents</CardTitle>
              <CardDescription className="mt-1">
                {entityName ? `Compliance documents for ${entityName}` : 'Required compliance and verification documents'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums text-foreground">
                  {uploadedCount}<span className="text-muted-foreground font-normal text-base">/{requiredDocuments.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  uploaded
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Progress bar */}
          <div className="w-full bg-muted/50 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                completionPercentage === 100 ? 'bg-emerald-500' :
                completionPercentage >= 50 ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage === 100 && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All required documents uploaded
            </p>
          )}
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Required Documents</CardTitle>
          <CardDescription>
            Upload all required documents to complete KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {requiredDocuments.map((docType) => {
                const uploaded = documents.find(d => d.type === docType.value)
                const isUploading = uploading === docType.value

                return (
                  <div
                    key={docType.value}
                    className={`flex items-center justify-between gap-4 py-3 px-4 rounded-lg border transition-colors ${
                      uploaded
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-border/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {uploaded ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${uploaded ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {docType.label}
                        </p>
                        {uploaded && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {uploaded.file_name} · {formatFileSize(uploaded.file_size_bytes)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Validation badge */}
                      {uploaded && renderValidationBadge(uploaded)}

                      {uploaded ? (
                        <>
                          {isPreviewableExtension(uploaded.file_name || '') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewer.openPreview({
                                id: uploaded.id,
                                file_name: uploaded.file_name,
                                name: uploaded.name,
                                file_size_bytes: uploaded.file_size_bytes,
                              })}
                              className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(uploaded)}
                            className="h-8 w-8 p-0"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(uploaded)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      ) : !readOnly && (
                        <>
                          <Input
                            ref={(el) => { fileInputRefs.current[docType.value] = el }}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleUpload(file, docType.value)
                            }}
                            disabled={isUploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRefs.current[docType.value]?.click()}
                            disabled={isUploading}
                            className="h-8 text-xs"
                          >
                            {isUploading ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Documents */}
      {documents.filter(d => !requiredDocuments.some(req => req.value === d.type)).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Documents</CardTitle>
            <CardDescription>
              Other documents uploaded for this entity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {documents
                .filter(d => !requiredDocuments.some(req => req.value === d.type))
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.file_name} · {formatFileSize(doc.file_size_bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isPreviewableExtension(doc.file_name || '') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewer.openPreview({
                            id: doc.id,
                            file_name: doc.file_name,
                            name: doc.name,
                            file_size_bytes: doc.file_size_bytes,
                          })}
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="h-8 w-8 p-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2">
        <p>Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT · Max 50MB per file</p>
        <p>Documents are stored securely and all upload actions are logged for audit trail.</p>
      </div>
    </div>

    {/* Document Preview Fullscreen Viewer */}
    <DocumentViewerFullscreen
      isOpen={viewer.isOpen}
      document={viewer.document}
      previewUrl={viewer.previewUrl}
      isLoading={viewer.isLoading}
      error={viewer.error}
      onClose={viewer.closePreview}
      onDownload={viewer.downloadDocument}
      watermark={viewer.watermark}
    />
    </>
  )
}

// Export the required documents config for external use
export { REQUIRED_DOCUMENTS }
